# --- deps: install all deps (dev included) for the build ---
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# --- builder: vite build (client) + esbuild bundle of server.ts ---
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Vite inlines VITE_-prefixed vars into the client bundle at build time, so it
# must be supplied here, not just as a runtime env var in the runner stage.
ARG VITE_ADMIN_BOOTSTRAP_PASSWORD
ENV VITE_ADMIN_BOOTSTRAP_PASSWORD=$VITE_ADMIN_BOOTSTRAP_PASSWORD
ENV NODE_ENV=production
RUN npm run build

# --- runner: minimal production image ---
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup -S app && adduser -S app -G app

# server.cjs is bundled with --packages=external, so real node_modules are
# still required at runtime (unlike the client bundle, which is self-contained).
COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder --chown=app:app /app/dist ./dist

USER app
EXPOSE 3000
ENV PORT=3000

CMD ["node", "dist/server.cjs"]
