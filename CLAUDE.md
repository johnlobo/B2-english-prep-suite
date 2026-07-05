# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install        # install dependencies
npm run dev         # start Express + Vite dev server on http://localhost:3000
npm run lint         # tsc --noEmit (this is the project's only "test" — there is no test suite)
npm run build        # vite build (client) + esbuild bundle of server.ts -> dist/server.cjs
npm start            # run the production build (node dist/server.cjs)
npm run clean        # rm -rf dist server.js
```

There is no test framework or CI configured in this repo. `npm run lint` (a plain `tsc --noEmit`) is
the only automated check — run it after any change.

Required env vars (see `.env.example`, loaded from `.env.local` via `dotenv` in `server.ts`):
- `GEMINI_API_KEY` — server-side, required for both AI tutor endpoints.
- `VITE_ADMIN_BOOTSTRAP_PASSWORD` — client-side (Vite-exposed), see Auth below.

## Architecture

### Two backends, not one

This app talks to **two independent backends** and it's easy to reach for the wrong one:

- **Firebase (Auth + Firestore + Storage)** is the real backend for everything user-facing: login,
  user profiles, progress tracking, admin user management, and podcast audio files. React components
  call the Firebase client SDK directly (`src/lib/firebase.ts` exports `auth`, `db`, `storage`) —
  there is no REST layer in between. See `Auth.tsx`, `App.tsx`, `UserManagement.tsx`.
- **`server.ts`** (Express, run via `tsx` in dev / bundled with esbuild for prod) only hosts three
  stateless endpoints that need a server-side secret or server-side work the browser can't do:
  - `POST /api/tutor/explain` — Gemini call to review one already-answered multiple-choice practice
    question (used by `ModuleSection.tsx`). Expects real `options`/`selectedOption`/`correctOption`.
  - `POST /api/tutor/chat` — Gemini call for open-ended student questions in the free chat tutor
    (used by `AITutor.tsx`). **Do not** reuse `/api/tutor/explain` for free-form chat — it forces
    the prompt into a "why is option A correct out of A/B/C/D" structure regardless of input, which
    was a real bug here before the endpoints were split.
  - `GET /api/export-excel` and `POST /api/sheets/sync` — Excel template export and the Google
    Sheets → question bank CSV import proxy (see below).
  - In dev mode, `server.ts` also mounts Vite's middleware; in prod it serves `dist/` as static files.
  It also has no login/session system of its own — do not add auth/progress endpoints here, that's
  Firestore's job.

### Content model: static bank + runtime Sheets overlay

`src/data/b2Data.ts` (~2,200 lines) is the hardcoded source of truth for the 4 study modules: theory
days, practice questions, control exams, and podcast episodes (`DEFAULT_B2_DATA`, plus
`getFullCombinedBank()` which flattens all questions for the exam simulator). Teachers can extend
this at runtime without a deploy: `SheetSync.tsx` posts a Google Sheet URL to `/api/sheets/sync`,
which fetches/parses it as CSV (custom hand-rolled parser, not a library) and returns extra
`Question` objects that `App.tsx` merges into `customQuestions` state, cached in `localStorage`
under `b2_custom_qs`. `/api/export-excel` generates the template (with an instructions sheet) that
matches the exact column/header contract the sync parser expects.

### Persistence: Firestore is primary, localStorage is a fallback mirror

Firestore collections: `users`, `progress`, `system` (holds the `system/setup` admin-bootstrap flag),
`notes`. Every read/write path in `Auth.tsx`/`App.tsx` also mirrors to `localStorage` (`b2_user`,
`b2_progress`, `b2_custom_qs`, `b2_sheet_url`, `b2_sync_date`, `b2_streak_count`,
`b2_last_active_date`) and falls back to it if Firestore is unreachable. When changing the shape of
`UserProgress`/`Question` in `types.ts`, keep both paths in sync.

### Auth and admin roles

Firebase Auth (email/password) provides identity; a `role` field (`'admin' | 'user'`) on the
Firestore `users/{uid}` doc drives UI gating (`usuarios`/`sheets` tabs in `App.tsx`). **Security is
enforced separately**: `firestore.rules` / `storage.rules` grant admin access by checking
`request.auth.token.email == 'admin@b2mastery.es'` directly, not the `role` field — setting
`role: 'admin'` on a user doc does not by itself grant Firestore/Storage write access.

The very first admin account is self-provisioned client-side: on login, if
`admin@b2mastery.es` + `VITE_ADMIN_BOOTSTRAP_PASSWORD` are entered and `system/setup.adminSetupComplete`
isn't `true` yet, `Auth.tsx` creates the Firebase Auth user on the fly. That flag flips to `true`
(permanently disabling the bootstrap path) once that admin sets a permanent password.

### Firebase Storage for podcast audio

Podcast episodes in `b2Data.ts` carry an `audioStoragePath` (an object path in the bucket, not a
URL). `AudioPlayer.tsx` resolves it to a playable URL via `getDownloadURL` from `firebase/storage`
at render time — new episodes need the raw audio file uploaded to the bucket (there's no upload UI;
it's done manually via the Firebase Console) plus the matching `audioStoragePath` added in
`b2Data.ts`.

### Frontend structure

Single-page app with no router — `App.tsx` holds `activeTab` state
(`dashboard | modules | chat | podcast | sheets | usuarios | simulacion`) and conditionally renders
one top-level component per tab; `sheets` and `usuarios` are only reachable when
`user.role === 'admin'`. `main.tsx` wraps the tree in `ErrorBoundary` (`src/components/ErrorBoundary.tsx`)
so an uncaught error in one tab shows a recoverable fallback instead of a blank page.
