# ── Build ─────────────────────────────────────────────────────────────────────
FROM node:22-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json* nest-cli.json tsconfig*.json ./
RUN npm ci

COPY apps/ apps/
COPY libs/ libs/
COPY prisma/ prisma/

RUN npx prisma generate
RUN npx nest build api-gateway

# ── Runtime ───────────────────────────────────────────────────────────────────
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nestjs \
 && adduser  --system --uid 1001 nestjs

COPY --from=builder /app/node_modules       ./node_modules
COPY --from=builder /app/dist/apps/api-gateway ./dist
COPY --from=builder /app/prisma             ./prisma

USER nestjs
EXPOSE 3000
CMD ["node", "dist/main"]
