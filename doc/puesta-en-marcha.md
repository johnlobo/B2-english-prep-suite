# Puesta en marcha desde cero

Pasos para dejar la aplicación funcionando tras clonar el repositorio.

## 1. Instalar dependencias

```bash
npm install
```

## 2. Configurar variables de entorno

Copia `.env.example` a `.env.local` (el nombre debe llevar el punto inicial; `dotenv` solo
reconoce `.env.local`, no `env.local`):

```bash
cp .env.example .env.local
```

Rellena:

- `GEMINI_API_KEY`: clave de la API de Gemini ([Google AI Studio](https://aistudio.google.com/apikey)).
- `VITE_ADMIN_BOOTSTRAP_PASSWORD`: contraseña temporal para crear la primera cuenta admin
  (`admin@b2mastery.es`). Solo se usa una vez, en el primer login (ver `Auth.tsx`).

## 3. Proyecto de Firebase

La app asume un proyecto de Firebase ya creado (config en `src/lib/firebase.ts`) con:

- **Authentication** con el proveedor email/contraseña habilitado.
- **Firestore** y **Storage** habilitados.
- Las reglas `firestore.rules` / `storage.rules` publicadas manualmente desde la consola de
  Firebase (Firestore/Storage → pestaña Rules → Publish). No se despliegan solas desde el repo.
- La **API key** del proyecto sin restricciones de "HTTP referrers" que bloqueen el dominio desde
  el que se accede a la app (por ejemplo, en local no suele haber problema, pero si se accede a
  través de un dominio o proxy —como `code-server.digitalpartners.es`—, ese dominio debe añadirse
  en Google Cloud Console → APIs & Services → Credentials → esa API key → Application
  restrictions → HTTP referrers). Si falta, Firebase Auth devuelve
  `auth/requests-from-referer-...-are-blocked`.

## 4. Arrancar en desarrollo

```bash
npm run dev
```

La app queda en `http://localhost:3000`.

**Si se accede detrás de un reverse proxy** (como el proxy de code-server, que sirve la app bajo
una ruta tipo `/proxy/3000/`), `vite.config.ts` ya incluye el ajuste de `base` y el
`codeServerProxyPlugin` necesarios para ese caso concreto (dominio
`code-server.digitalpartners.es`, puerto 3000). Si se despliega o accede de otra forma (sin ese
proxy, o con otro puerto/dominio), hay que ajustar o quitar `PROXY_BASE` en ese archivo o los
recursos estáticos devolverán 404 y la página se verá en blanco.

## 5. Primer login (bootstrap del admin)

Entra con `admin@b2mastery.es` y la contraseña de `VITE_ADMIN_BOOTSTRAP_PASSWORD`. Esto crea la
cuenta de Firebase Auth y marca `system/setup.adminSetupComplete` como completado (deshabilitando
esta vía de bootstrap). A partir de ahí, cambia la contraseña desde la propia app.

## Otros comandos

```bash
npm run lint    # tsc --noEmit — único chequeo automático, no hay tests
npm run build   # build de producción (cliente + servidor)
npm start       # sirve el build de producción
```
