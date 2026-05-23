# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
npm run start:dev              # Start the main app with file watching
nest start <service> --watch   # Start a specific service (e.g. vehicle-service)

# Build & Lint
npm run build                  # Build all apps
npm run lint                   # Lint and auto-fix with ESLint + Prettier
npm run format                 # Format code with Prettier

# Tests
npm test                       # Run all unit tests
npm run test:watch             # Watch mode
npm run test:cov               # Coverage report
npm test -- --testPathPattern=vehicle-service  # Run tests for a single service

# Database
docker-compose up -d           # Start PostgreSQL + PGAdmin
npx prisma migrate dev         # Apply migrations
npx prisma generate            # Regenerate Prisma client
npx prisma studio              # Open Prisma Studio UI
```

Environment variables must be configured from `.env.example` before running.

## Architecture

NestJS monorepo (`nest-cli.json`) with 6 microservices and 2 shared libraries. Each service is an independent NestJS app with its own port.

```
apps/
  api-gateway/          Port: API_GATEWAY_PORT (3000)
  auth-service/         Port: AUTH_SERVICE_PORT (3001)
  vehicle-service/      Port: VEHICLE_SERVICE_PORT (3002)
  traffic-service/      Port: TRAFFIC_SERVICE_PORT (3003)
  incident-service/     Port: INCIDENT_SERVICE_PORT (3004)
  notification-service/ Port: NOTIFICATION_SERVICE_PORT (3005)
libs/
  common/               Shared utilities — imported as @app/common
  prisma-client/        Prisma wrapper — imported as @app/prisma-client
prisma/
  schema.prisma         Single schema for all services (PostgreSQL)
```

**Path aliases** (defined in `tsconfig.json`):
- `@app/common` → `libs/common/src`
- `@app/prisma-client` → `libs/prisma-client/src`

## Data Models

Core Prisma entities:
- **User** — `role: ADMIN | OPERATOR`, owns vehicles, reports incidents
- **Vehicle** — `type: CAR | TRUCK | BUS | MOTORCYCLE`, `status: ACTIVE | INACTIVE | MAINTENANCE`, linked to GpsPositions
- **GpsPosition** — lat/lng/speed snapshot per vehicle
- **TrafficZone** — geographic circle (lat/lng/radius), `level: LOW | MEDIUM | HIGH`
- **Incident** — `type: ACCIDENT | CONSTRUCTION | ROAD_CLOSED | TRAFFIC_JAM`, `status: REPORTED | IN_PROGRESS | RESOLVED`
- **Notification** — per-user messages with read tracking

## Implementation Status

Services currently use **in-memory storage**; Prisma client is installed but not yet wired into service implementations. Planned but not yet implemented: Prisma integration, GraphQL resolvers (packages installed), WebSocket gateways (socket.io installed), JWT auth guards, and inter-service communication.

## Tech Stack

- **NestJS 11** with Express
- **Prisma 6** on PostgreSQL 16
- **Apollo Server / @nestjs/graphql** for GraphQL (schema-first or code-first TBD)
- **socket.io / @nestjs/websockets** for real-time updates
- **passport-jwt** for authentication
- **Jest + ts-jest** for testing
- **ESLint 9 flat config** + Prettier
