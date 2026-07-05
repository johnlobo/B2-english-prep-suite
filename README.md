# B2 English Prep Suite

Plataforma interactiva de preparación para el examen oficial **Cambridge B2 First**, con módulos de
teoría diaria, práctica y exámenes de control, un simulador de examen cronometrado, un tutor de IA
(Gemini), reproductor de podcasts y sincronización del banco de preguntas vía Google Sheets.

## Funcionalidades

- **4 módulos de estudio**: teoría diaria por días, prácticas cortas y examen de control por módulo.
- **Simulador de examen**: examen completo cronometrado con todas las preguntas del banco.
- **Tutor de IA (Gemini)**: explicación detallada al revisar una pregunta ya respondida, y un chat
  libre para dudas gramaticales abiertas.
- **Podcasts**: episodios de audio con transcripción, servidos desde Firebase Storage.
- **Sincronización con Google Sheets**: amplía el banco de preguntas publicando una hoja de cálculo
  como CSV, sin necesidad de desplegar código nuevo. Incluye plantilla Excel descargable con las
  instrucciones de formato.
- **Panel de administración**: gestión de usuarios y roles (requiere cuenta admin).

## Stack técnico

- **Frontend**: React 19 + Vite + Tailwind CSS.
- **Servidor**: Express (`server.ts`), sirve el frontend (dev: middleware de Vite; prod: estático
  desde `dist/`) y expone los endpoints que necesitan un secreto de servidor (Gemini, export a
  Excel, proxy de sincronización de Sheets).
- **Backend de datos**: Firebase (Auth + Firestore + Storage) — el cliente habla directamente con
  Firebase, no a través del servidor Express.

Para el detalle de arquitectura (por qué hay dos backends, cómo se combinan los datos estáticos con
la sincronización de Sheets, el modelo de persistencia, roles y reglas de seguridad), consulta
[`CLAUDE.md`](CLAUDE.md).

## Ejecutar en local

**Requisitos:** Node.js

1. Instala las dependencias:
   ```bash
   npm install
   ```
2. Copia `.env.example` a `.env.local` y rellena:
   - `GEMINI_API_KEY`: clave de la API de Gemini (créala en [Google AI Studio](https://aistudio.google.com/apikey)).
   - `VITE_ADMIN_BOOTSTRAP_PASSWORD`: contraseña temporal para crear la primera cuenta de
     administrador (`admin@b2mastery.es`) la primera vez que se accede a un proyecto de Firebase sin
     configurar todavía. Solo es necesaria antes de completar ese primer inicio de sesión.
3. Arranca el servidor de desarrollo:
   ```bash
   npm run dev
   ```
   La app queda disponible en `http://localhost:3000`.

Otros scripts disponibles:

```bash
npm run lint    # tsc --noEmit — comprobación de tipos (no hay suite de tests todavía)
npm run build   # build de producción (cliente + servidor)
npm start       # sirve el build de producción
```

## Configuración de Firebase

Este proyecto asume un proyecto de Firebase ya creado con Authentication (email/contraseña),
Firestore y Storage habilitados. Las reglas de seguridad versionadas en el repo
(`firestore.rules`, `storage.rules`) deben publicarse manualmente desde la consola de Firebase
(Firestore/Storage → pestaña Rules → Publish); no se despliegan automáticamente desde este repo.
