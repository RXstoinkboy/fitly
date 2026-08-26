# =============================================================================
# Fitly Backend — Production Dockerfile (multi-stage)
# =============================================================================
# The build context is the MONOREPO ROOT (npm workspaces — the lockfile lives
# there, not in apps/backend/):
#
#   docker build -t fitly-backend:latest -f apps/backend/Dockerfile .
#
# Or via compose (from apps/backend/):
#
#   docker compose --env-file .env.production -f docker-compose.prod.yml up -d --build
# =============================================================================

# ---------------------------------------------------------------------------
# Stage 1: Base — shared dependencies
# ---------------------------------------------------------------------------
FROM node:22-alpine AS base

RUN apk add --no-cache tini

WORKDIR /app

# ---------------------------------------------------------------------------
# Stage 2: Build — install workspace deps + compile TypeScript
# ---------------------------------------------------------------------------
FROM base AS build

# Root workspace manifests (lockfile lives at the monorepo root).
# Stub package.json files for all workspaces so `npm ci --workspace` can
# validate the lockfile without pulling in the other apps' source.
COPY package.json package-lock.json ./
COPY apps/backend/package.json ./apps/backend/package.json
COPY apps/mobile/package.json ./apps/mobile/package.json
RUN npm ci --workspace @virtual-try-on/backend

COPY apps/backend ./apps/backend
WORKDIR /app/apps/backend

# The AdonisJS assembler compiles TS into ./build and generates
# ./build/ace.js + ./build/package.json with the `#imports` map fixed up
# so the compiled app runs standalone. (Plain `tsc` is NOT enough — the
# `#config/*` imports would resolve to nonexistent root paths at runtime.)
RUN npx tsx bin/console.ts build

# ---------------------------------------------------------------------------
# Stage 3: Production — minimal runtime image
# ---------------------------------------------------------------------------
FROM base AS production

# Create non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Same workspace manifests + lockfile as the build stage, prod deps only
COPY --from=build /app/package.json /app/package-lock.json ./
COPY --from=build /app/apps/backend/package.json ./apps/backend/package.json
COPY --from=build /app/apps/mobile/package.json ./apps/mobile/package.json
RUN npm ci --omit=dev --workspace @virtual-try-on/backend && npm cache clean --force

# The standalone build (bin/, config/, app/, ace.js, package.json)
COPY --from=build /app/apps/backend/build ./apps/backend

ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=3333

WORKDIR /app/apps/backend
EXPOSE 3333

USER appuser

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "bin/server.js"]
