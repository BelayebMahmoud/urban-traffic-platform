# ================================================================
# Dockerfile — Urban Traffic Platform (api-gateway)
# Build context: monorepo root
#   docker build -f apps/api-gateway/Dockerfile .
# ================================================================

# ── Stage 1: Builder ────────────────────────────────────────────
FROM node:22-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json* nest-cli.json tsconfig*.json ./
# Install all deps (devDeps required for nest build)
RUN npm ci

COPY apps/ apps/
COPY libs/ libs/
COPY prisma/ prisma/

RUN npx prisma generate
RUN npx nest build api-gateway

# Install production-only deps for the runtime stage
RUN npm ci --omit=dev --ignore-scripts && npx prisma generate

# ── Stage 2: Production runtime ─────────────────────────────────
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nestjs \
 && adduser  --system --uid 1001 nestjs

# Copy only production node_modules and compiled output
COPY --from=builder --chown=nestjs:nestjs /app/node_modules       ./node_modules
COPY --from=builder --chown=nestjs:nestjs /app/dist/apps/api-gateway ./dist
COPY --from=builder --chown=nestjs:nestjs /app/prisma             ./prisma

USER nestjs
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

CMD ["node", "dist/main"]
