# Despliegue en producción (mismo esquema que LinkSafe)

La app se despliega como imagen Docker publicada en GHCR, detrás de Nginx Proxy Manager, en el
mismo VPS que `LinkSafe`. El repo ya incluye `Dockerfile`, `docker-compose.yml` y
`.github/workflows/release.yml`. Lo que queda son pasos manuales (secrets, servidor, Firebase y NPM)
que no se pueden hacer desde aquí.

## 1. Secrets de GitHub Actions (Settings → Secrets and variables → Actions)

En este repo (`johnlobo/B2-english-prep-suite`), añade:

- `SSH_HOST`, `SSH_PORT`, `SSH_USER`, `SSH_PRIVATE_KEY` — mismos valores que en el repo `LinkSafe`
  (mismo VPS).
- `VITE_ADMIN_BOOTSTRAP_PASSWORD` — nuevo, específico de esta app. Se usa como build-arg de Docker
  porque Vite lo incrusta en el bundle del cliente en tiempo de build (no vale como variable de
  runtime).

`GEMINI_API_KEY` **no** es un secret de GitHub: se define solo en el `.env` del servidor (paso 2),
porque es server-only y solo hace falta en runtime.

## 2. Servidor: carpeta y `.env`

Por SSH al VPS:

```bash
mkdir -p /home/ubuntu/docker/b2-english-prep-suite
cd /home/ubuntu/docker/b2-english-prep-suite
```

Copia el `docker-compose.yml` de este repo a esa carpeta (o clónalo ahí y usa ese archivo
directamente), y crea un `.env` junto a él:

```
GEMINI_API_KEY=tu_clave_de_gemini
FIREBASE_SERVICE_ACCOUNT_KEY_BASE64=tu_clave_de_servicio_en_base64
```

`FIREBASE_SERVICE_ACCOUNT_KEY_BASE64` la necesita `server.ts` (`firebaseAdmin.ts`/`serverAuth.ts`)
para verificar el token de Firebase ID en cada petición a `/api/*` — ver la sección 6 (Incidente
Authelia) sobre por qué existe. Para generarla:

1. Firebase Console → ⚙️ Configuración del proyecto → **Cuentas de servicio** → "Generar nueva
   clave privada" (descarga un `.json`).
2. `base64 -w0 esa-clave.json` → pega el resultado como valor de la variable.

**Importante**: `docker-compose.yml` **no se sincroniza solo** desde este repo al servidor — el
workflow de release solo hace `docker compose pull` + `docker compose up -d` con el archivo que ya
esté en esa carpeta del VPS. Si cambias `docker-compose.yml` en el repo (por ejemplo al añadir una
variable de entorno nueva), tienes que copiar el cambio a mano también al archivo del servidor.

`docker-compose.yml` usa la red externa `proxy-network` (la misma que usa Nginx Proxy Manager y
`linksafe`) — debe existir ya en el host; si no, créala con
`docker network create proxy-network`.

## 3. Nginx Proxy Manager

Nuevo Proxy Host:

- **Domain**: `b2prep.digitalpartners.es`
- **Forward Hostname/IP**: `b2-english-prep-suite` (nombre del contenedor, igual que `linksafe`
  para su proxy host)
- **Forward Port**: `3000`
- SSL: pide certificado (Let's Encrypt) igual que para los demás hosts.

Si este dominio va detrás de **Authelia** (login SSO delante de varios subdominios del VPS), en la
pestaña **Advanced** del proxy host hace falta el bloque estándar de integración, **más** un bloque
que excluye `/api/*` de esa protección (ver sección 6 — es imprescindible, no opcional):

```nginx
# Protección Authelia para el resto de la app (páginas, assets)
auth_request /authelia;
auth_request_set $target_url $scheme://$http_host$request_uri;
error_page 401 =302 https://authelia.digitalpartners.es/?rd=$target_url;

location /authelia {
    internal;
    proxy_pass http://authelia:9091/api/verify;
    proxy_set_header Host $host;
    proxy_set_header X-Original-URL $scheme://$http_host$request_uri;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}

auth_request_set $user $upstream_http_remote_user;
proxy_set_header Remote-User $user;

# /api/* se protege solo (requireAuth/requireAdmin en server.ts, ver sección 6) — no debe pasar
# por Authelia.
location /api/ {
    auth_request off;
    proxy_pass http://b2-english-prep-suite:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

## 4. Firebase / Google Cloud Console

Mismo problema que ya se resolvió para el dominio de code-server, pero ahora con el dominio final:

- **Firebase Console → Authentication → Settings → Authorized domains**: añade
  `b2prep.digitalpartners.es`.
- **Google Cloud Console → APIs & Services → Credentials** → API key del proyecto `b2-prep`
  (`AIzaSyDpFIxjyF-_lsqtqMN3XJEUtUZBM65cdFc`) → **Application restrictions → HTTP referrers**:
  añade `https://b2prep.digitalpartners.es/*` (sin quitar las entradas existentes, como la de
  code-server).

## 5. Lanzar el release

Desde local o code-server:

```bash
git tag v1.0.0
git push origin v1.0.0
```

Luego en GitHub → Releases → New release → selecciona el tag → Publish. Esto dispara el workflow:
build de la imagen → push a `ghcr.io/johnlobo/b2-english-prep-suite` → despliegue por SSH
(`docker compose pull && docker compose up -d`) en el servidor.

Verifica en Repo → Actions que el workflow termina en verde, y en Repo → Packages que aparece la
imagen publicada.

## 6. Incidente Authelia + `auth_request` (2026-07-06/07) — por qué existe lo de la sección 3

**Síntoma**: el Tutor de IA y la sincronización de Sheets fallaban con `500 Internal Server Error`
y el body de la respuesta era HTML (`Unexpected token '<', "<html>..."` al hacer `res.json()` en el
frontend). El resto de la app (login, navegación, `GET /api/export-excel` al principio) funcionaba
sin problema.

**Diagnóstico** (por descarte, ver conversación completa si hace falta el detalle):

1. Se reprodujo `/api/sheets/sync` en local con la misma URL de Google Sheets del usuario → `200 OK`.
   Se descartó un bug en el parseo/sync en sí.
2. `docker logs b2-english-prep-suite` no mostraba nada para esas peticiones → la petición no
   estaba llegando ni siquiera a la app.
3. `docker exec b2-english-prep-suite curl ... http://localhost:3000/api/sheets/sync` (saltándose
   nginx) → `200 OK`. Confirmado: la app funciona, el problema está en el proxy delante.
4. El log de error de nginx por proxy host (`/data/logs/proxy-host-<ID>_error.log` dentro del
   contenedor `nginx-proxy-manager`, **no** `docker logs nginx-proxy-manager` — ese solo tiene el
   log del propio backend de gestión de NPM) mostró la causa exacta:
   ```
   auth request unexpected status: 408 while sending to client, ... request: "POST /api/sheets/sync ..."
   ```
5. El log de `docker logs authelia` confirmó timeouts (`i/o timeout` leyendo la petición) en los
   mismos segundos exactos.

**Causa raíz**: el proxy host tenía `auth_request /authelia;` delante de toda la app (snippet
estándar de integración de Authelia con nginx). El módulo `auth_request` de nginx solo sabe
interpretar `200` (autorizado) y `401`/`403` (denegado, con el `error_page` para redirigir al
login) del subrequest de verificación — **cualquier otro código (un `408`, timeouts) se convierte
siempre en un `500` genérico**, sin que la petición llegue nunca a la app. Esto es una limitación
de diseño del módulo, no un bug de configuración: no hay forma de que nginx gestione ese caso de
forma más amable desde el propio bloque `auth_request`.

Se probó primero un reintento automático en el frontend (`fetchWithRetry` /
`src/lib/fetchWithRetry.ts`, 1 reintento tras 1.5s en respuestas 5xx) como mitigación rápida — útil
para fallos puntuales, pero insuficiente cuando Authelia falla de forma sistemática (varias
peticiones seguidas, todas con el mismo patrón de timeout).

**Fix definitivo, en dos partes** (las dos son necesarias, ninguna basta sola):

1. **`server.ts` verifica su propia autenticación** (`firebaseAdmin.ts` + `serverAuth.ts`,
   `requireAuth`/`requireAdmin`) contra un token de Firebase ID, en vez de depender por completo de
   Authelia. El frontend adjunta el token vía `authedFetchWithRetry`
   (`src/lib/fetchWithRetry.ts`). Esto por sí solo **no bastaba**: si `auth_request` sigue delante
   y Authelia sigue fallando, nginx corta la petición en la fase de `auth_request` — antes de
   llegar a `proxy_pass` — así que la app nunca ve la petición pase lo que pase en su propio código.
2. **Excluir `/api/*` de `auth_request` en nginx** (bloque `location /api/ { auth_request off; ... }`
   de la sección 3). Solo es seguro hacer esto *después* del paso 1 — si se hace sin la
   autenticación propia del backend, `/api/*` queda expuesto sin ninguna protección.

Requiere la variable `FIREBASE_SERVICE_ACCOUNT_KEY_BASE64` (ver sección 2). Releases relevantes:
`v1.1.1` (reintento, mitigación parcial), `v1.1.2` (fix no relacionado: `setDoc()` fallaba con
`Unsupported field value: undefined` al sincronizar preguntas de examen sin columna `Day` — bug
preexistente que solo se manifestó al llegar por fin una petición completa hasta Firestore),
`v1.2.0` (autenticación propia en `server.ts`, el fix real del incidente).
