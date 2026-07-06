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
```

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
