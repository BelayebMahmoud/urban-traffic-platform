# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Backend — api-gateway is the sole entry point (bundles all services)
nest start api-gateway --watch

# Frontend — Next.js app (port 3006)
cd frontend && npm run dev

# Build & Lint
npm run build                  # Build all NestJS apps
npm run lint                   # Lint and auto-fix with ESLint + Prettier
npm run format                 # Format code with Prettier

# Tests
npm test                       # Run all unit tests
npm run test:watch             # Watch mode
npm run test:cov               # Coverage report
npm test -- --testPathPattern=vehicle-service  # Run tests for a single service

# Database (MySQL 8 via Docker)
docker-compose up -d                    # Start MySQL
docker-compose --profile frontend up -d # Also start the frontend container
npx prisma migrate dev                  # Apply migrations
npx prisma generate                     # Regenerate Prisma client
npx prisma studio                       # Open Prisma Studio UI
```

Environment variables must be configured from `.env.example` before running. `DATABASE_URL` must use a **MySQL** connection string (e.g. `mysql://root:@localhost:3306/urban_traffic`). For Docker Compose: `mysql://${DB_USER}:${DB_PASSWORD}@mysql:3306/${DB_NAME}`.

## Architecture

NestJS monorepo (`nest-cli.json`) structured as a **modular monolith**: all service modules are imported into `api-gateway` and run in one process. The individual `main.ts` files in other `apps/` directories exist for potential future extraction but are not used for normal development.

```
apps/
  api-gateway/          Port: API_GATEWAY_PORT (3000) — sole HTTP/WS entry point
  auth-service/         Module imported by api-gateway
  vehicle-service/      Module imported by api-gateway
  traffic-service/      Module imported by api-gateway
  incident-service/     Module imported by api-gateway
  notification-service/ Module imported by api-gateway
libs/
  common/               Guards, decorators, JWT strategy, EventsGateway — imported as @app/common
  prisma-client/        Global PrismaClientModule wrapping PrismaClient — imported as @app/prisma-client
prisma/
  schema.prisma         Single MySQL 8 schema for all services
frontend/               Next.js 16 app (port 3006)
  src/lib/api.ts        All API calls (REST + GraphQL)
  src/lib/auth.tsx      AuthContext — JWT stored in localStorage
  src/components/       Shared UI (layout, charts, cards)
  src/app/              Next.js App Router pages
```

**Path aliases** (defined in `tsconfig.json`):
- `@app/common` → `libs/common/src`
- `@app/prisma-client` → `libs/prisma-client/src`

## API Layer (Dual Pattern)

The backend exposes **two API surfaces** on the same port (3000):

**GraphQL** at `/graphql` (Apollo, code-first) — used **only for auth**:
- `mutation login`, `mutation register`, `query me`
- Schema is auto-generated to `schema.gql` at startup
- `JwtAuthGuard` + `@CurrentUser()` extract `{ id, email, role }` from the GraphQL context

**REST** at `/` — used for everything else:
- `GET/POST /vehicles`, `GET/POST /:id/positions/simulate`, `GET /:id/movements`
- `GET/POST /traffic-zones`, `GET /traffic-zones/congested`, `PATCH /traffic-zones/density`
- `GET/POST/PATCH /incidents`, `PATCH /incidents/:id/status`
- `GET/POST/PATCH /notifications`, `PATCH /notifications/:id/read`
- `GET/PATCH /admin/users`, `PATCH /admin/users/:id/toggle`
- `GET /health` — checks DB connectivity + heap memory

`JwtAuthGuard` and `RolesGuard` (from `@app/common`) work on both REST and GraphQL. `@Roles('ADMIN')` requires the role guard to also be applied.

## WebSocket

`EventsGateway` (in `libs/common/src/events/events.gateway.ts`) runs on the same port as HTTP. Clients emit `join` with a `userId` to subscribe to per-user notifications. The gateway emits:
- `incident:new` → broadcast to all on new incident
- `zone:updated` → broadcast to all when traffic density changes
- `notification:new` → targeted to `user:${userId}` room

Services that need to emit events (incident, traffic, notification) inject `EventsGateway` via `EventsModule` from `@app/common`.

## Frontend

Next.js 16 (App Router) at `frontend/`, served on port 3006. All API calls go through `src/lib/api.ts` using axios. Auth calls use GraphQL; all other calls use REST.

**Auth flow**: `AuthProvider` (`src/lib/auth.tsx`) stores JWT + user in `localStorage`. `AuthGuard` (`src/components/layout/AuthGuard.tsx`) redirects unauthenticated users to `/login`. TanStack Query handles server state with a 30s stale time.

**Frontend stack**: Next.js 16, React 19, TanStack Query, axios, Recharts, Tailwind CSS, Framer Motion, lucide-react.

## Data Models

Core Prisma entities (MySQL 8):
- **User** — `role: ADMIN | OPERATOR`, owns vehicles, reports incidents
- **Vehicle** — `type: CAR | TRUCK | BUS | MOTORCYCLE`, `status: ACTIVE | INACTIVE | MAINTENANCE`, linked to GpsPositions
- **GpsPosition** — lat/lng/speed snapshot per vehicle (used for movement history and GPS simulation)
- **TrafficZone** — geographic circle (lat/lng/radius), `density: Float`, `level: LOW | MEDIUM | HIGH` (density ≥70→HIGH, ≥30→MEDIUM, else LOW)
- **Incident** — `type: ACCIDENT | CONSTRUCTION | ROAD_CLOSED | TRAFFIC_JAM`, `status: REPORTED | IN_PROGRESS | RESOLVED`, optionally linked to a TrafficZone
- **Notification** — per-user messages with `isRead` tracking, `type: String`, optional `referenceId`

## Tech Stack

- **NestJS 11** with Express
- **Prisma 6** on MySQL 8
- **Apollo Server / @nestjs/graphql** — code-first GraphQL (auth only)
- **socket.io / @nestjs/websockets** for real-time updates
- **passport-jwt** for JWT authentication (HS256, secret from `JWT_SECRET`)
- **bcryptjs** for password hashing (salt rounds: 10)
- **Jest + ts-jest** for testing
- **ESLint 9 flat config** + Prettier
