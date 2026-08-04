# =============================================================================
# Fitly Backend — Production Dockerfile (multi-stage)
# =============================================================================
# Build:  docker build -t fitly-backend:latest -f apps/backend/Dockerfile apps/backend
# Run:    docker run -d --env-file .env.production -p 3333:3333 fitly-backend:latest
# Compose: docker compose -f apps/backend/docker-compose.prod.yml up -d --build
# =============================================================================

# ---------------------------------------------------------------------------
# Stage 1: Base — shared dependencies
# ---------------------------------------------------------------------------
FROM node:22-alpine AS base

RUN apk add --no-cache tini
RUN corepack enable && corepack prepare npm@11.3.0 --activate

WORKDIR /app

# ---------------------------------------------------------------------------
# Stage 2: Build — install all deps + compile TypeScript
# ---------------------------------------------------------------------------
FROM base AS build

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# Prune dev dependencies (keep only production deps)
RUN npm ci --omit=dev && npm cache clean --force

# ---------------------------------------------------------------------------
# Stage 3: Production — minimal runtime image
# ---------------------------------------------------------------------------
FROM base AS production

# Create non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Copy compiled app + production node_modules from build stage
COPY --from=build /app/build ./build
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./

# Set up production defaults
ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=3333

EXPOSE 3333

USER appuser

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "build/bin/server.js"]