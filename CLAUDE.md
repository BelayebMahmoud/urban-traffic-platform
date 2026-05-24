# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development — api-gateway is the sole entry point (bundles all services)
nest start api-gateway --watch

# Build & Lint
npm run build                  # Build all apps
npm run lint                   # Lint and auto-fix with ESLint + Prettier
npm run format                 # Format code with Prettier

# Tests
npm test                       # Run all unit tests
npm run test:watch             # Watch mode
npm run test:cov               # Coverage report
npm test -- --testPathPattern=vehicle-service  # Run tests for a single service

# Database (MySQL via Docker)
docker-compose up -d           # Start MySQL
npx prisma migrate dev         # Apply migrations
npx prisma generate            # Regenerate Prisma client
npx prisma studio              # Open Prisma Studio UI
```

Environment variables must be configured from `.env.example` before running. `DATABASE_URL` must point to MySQL.

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
  schema.prisma         Single MySQL schema for all services
```

**Path aliases** (defined in `tsconfig.json`):
- `@app/common` → `libs/common/src`
- `@app/prisma-client` → `libs/prisma-client/src`

## Data Flow

**GraphQL (code-first)** is the API layer. Apollo Server runs at `/graphql`. Schema is auto-generated to `schema.gql` at startup. Every service exposes a `@Resolver()` that calls its `@Injectable()` service, which calls `PrismaClientService` directly.

**Authentication**: `JwtAuthGuard` (from `@app/common`) validates Bearer tokens on any resolver decorated with `@UseGuards(JwtAuthGuard)`. `@CurrentUser()` decorator extracts the JWT payload (`{ id, email, role }`) from the GraphQL context. `@Roles('ADMIN')` + `RolesGuard` enforces role-level access.

**WebSocket**: `EventsGateway` (defined in `libs/common/src/events/events.gateway.ts`, re-exported from `apps/api-gateway/src/events/events.gateway.ts`) runs on the same port as HTTP. Clients emit `join` with a `userId` to subscribe to per-user notifications. The gateway emits:
- `incident:new` → broadcast to all on new incident
- `zone:updated` → broadcast to all when traffic density changes
- `notification:new` → targeted to `user:${userId}` room

Services that need to emit events (incident, traffic, notification) inject `EventsGateway` via `EventsModule` from `@app/common`.

## Data Models

Core Prisma entities (MySQL):
- **User** — `role: ADMIN | OPERATOR`, owns vehicles, reports incidents
- **Vehicle** — `type: CAR | TRUCK | BUS | MOTORCYCLE`, `status: ACTIVE | INACTIVE | MAINTENANCE`, linked to GpsPositions
- **GpsPosition** — lat/lng/speed snapshot per vehicle (used for movement history and GPS simulation)
- **TrafficZone** — geographic circle (lat/lng/radius), `density: Float`, `level: LOW | MEDIUM | HIGH` (density ≥70→HIGH, ≥30→MEDIUM, else LOW)
- **Incident** — `type: ACCIDENT | CONSTRUCTION | ROAD_CLOSED | TRAFFIC_JAM`, `status: REPORTED | IN_PROGRESS | RESOLVED`, optionally linked to a TrafficZone
- **Notification** — per-user messages with `isRead` tracking

## Tech Stack

- **NestJS 11** with Express
- **Prisma 6** on MySQL 8
- **Apollo Server / @nestjs/graphql** — code-first GraphQL
- **socket.io / @nestjs/websockets** for real-time updates
- **passport-jwt** for JWT authentication (HS256, secret from `JWT_SECRET`)
- **bcryptjs** for password hashing (salt rounds: 10)
- **Jest + ts-jest** for testing
- **ESLint 9 flat config** + Prettier
