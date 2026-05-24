# Urban Traffic Platform

[![CI](https://github.com/BelayebMahmoud/urban-traffic-platform/actions/workflows/ci.yml/badge.svg)](https://github.com/BelayebMahmoud/urban-traffic-platform/actions/workflows/ci.yml)
[![Security Scan](https://github.com/BelayebMahmoud/urban-traffic-platform/actions/workflows/security.yml/badge.svg)](https://github.com/BelayebMahmoud/urban-traffic-platform/actions/workflows/security.yml)

A full-stack urban traffic management system built with **NestJS**, **Next.js**, and **MySQL**. The backend exposes a **GraphQL API** consumed by the frontend, a **real-time WebSocket** layer for live events, and a dark-themed dashboard with a **live vehicle tracking map**.

---

## Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Local Development](#local-development)
  - [Docker Compose](#docker-compose)
- [Environment Variables](#environment-variables)
- [Frontend API Layer](#frontend-api-layer)
- [API Reference](#api-reference)
  - [Auth (GraphQL only)](#auth-graphql-only)
  - [Vehicles](#vehicles)
  - [Traffic Zones](#traffic-zones)
  - [Incidents](#incidents)
  - [Notifications](#notifications)
  - [Admin (REST only)](#admin-rest-only)
- [WebSocket Events](#websocket-events)
- [Role-Based Access Control](#role-based-access-control)
- [Data Models](#data-models)
- [CI/CD](#cicd)
- [Commands Reference](#commands-reference)

---

## Features

- **Vehicle management** — register vehicles with an initial GPS position, track status (Active / Inactive / Maintenance)
- **Live GPS tracking** — record positions manually or via simulation; every update broadcasts a `vehicle:position` socket event
- **Interactive map** — real-time Leaflet map on the dashboard showing vehicle markers, traffic zone overlays, and incident pins
- **Traffic zones** — geographic circles with auto-classified congestion level (LOW / MEDIUM / HIGH) based on density
- **Incident reporting** — declare and manage incidents (Accident, Construction, Road Closed, Traffic Jam) with lifecycle status
- **Notifications** — per-user targeted notifications delivered via WebSocket to the correct room
- **Role-based access** — ADMIN and OPERATOR roles with granular per-operation enforcement
- **JWT authentication** — HS256 tokens issued on login/register, validated on every protected operation

---

## Architecture

```
┌─────────────────────────────────────────────────┐
│             Next.js Frontend  :3006             │
│   Dashboard · Map · Vehicles · Incidents        │
│   Tailwind CSS · TanStack Query · Leaflet       │
│                                                 │
│   src/lib/api.ts — single GraphQL client layer  │
└────────────────────┬────────────────────────────┘
                     │ POST /graphql  (all services)
                     │ REST /admin    (user mgmt only)
                     │ ws://          (socket.io)
                     ▼
┌─────────────────────────────────────────────────┐
│              API Gateway  :3000                 │
│                                                 │
│  ┌──────────┐ ┌─────────┐ ┌──────────┐         │
│  │   Auth   │ │ Vehicle │ │ Traffic  │         │
│  │ Resolver │ │Resolver │ │ Resolver │         │
│  └──────────┘ └─────────┘ └──────────┘         │
│  ┌──────────┐ ┌──────────────────────────┐     │
│  │ Incident │ │   Notification Resolver  │     │
│  │ Resolver │ └──────────────────────────┘     │
│  └──────────┘                                  │
│  ┌──────────────────────┐                      │
│  │  Admin Controller    │  ← REST only          │
│  │  GET  /admin/users   │                      │
│  │  PATCH /admin/:id/   │                      │
│  └──────────────────────┘                      │
│                                                 │
│              EventsGateway (socket.io)          │
└────────────────────┬────────────────────────────┘
                     │ Prisma ORM
                     ▼
            ┌────────────────┐
            │    MySQL 8     │
            └────────────────┘
```

All services run in **one process** (modular monolith). The individual `apps/*/main.ts` files exist for potential future extraction but are not used in normal development.

**API design:**
- Every service (auth, vehicles, traffic, incidents, notifications) exposes only a `@Resolver()` — no REST controller
- The only REST surface is `GET /admin/users` and `PATCH /admin/users/:id/toggle`, handled by the auth-service admin controller
- `ws://localhost:3000` — real-time socket.io events on the same port

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend framework | NestJS 11 + Express |
| API | GraphQL code-first — Apollo Server 5 (`@nestjs/graphql`) |
| Real-time | socket.io / @nestjs/websockets |
| ORM | Prisma 6 |
| Database | MySQL 8 |
| Auth | JWT HS256 — passport-jwt + bcryptjs |
| Validation | class-validator + class-transformer |
| Testing | Jest + ts-jest |
| Frontend | Next.js 16 (App Router) + React 19 |
| UI | Tailwind CSS + Framer Motion + lucide-react |
| Map | Leaflet + react-leaflet (CartoDB Dark Matter tiles) |
| State | TanStack Query v5 |
| Charts | Recharts |
| Linting | ESLint 9 flat config + Prettier |
| CI/CD | GitHub Actions — lint → test → build → Docker |

---

## Getting Started

### Local Development

**Prerequisites:** Node.js 20+, MySQL 8 running locally (XAMPP or native)

```bash
# 1. Clone and install
git clone https://github.com/BelayebMahmoud/urban-traffic-platform.git
cd urban-traffic-platform
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env — set DATABASE_URL and JWT_SECRET

# 3. Run database migrations
npx prisma migrate dev --name init

# 4. Start the backend (port 3000)
nest start api-gateway --watch

# 5. In a second terminal — start the frontend (port 3006)
cd frontend && npm install && npm run dev
```

| URL | Description |
|---|---|
| `http://localhost:3006` | Next.js dashboard |
| `http://localhost:3000/graphql` | Apollo GraphQL Sandbox |
| `http://localhost:3000/health` | Health check (DB + memory) |
| `ws://localhost:3000` | WebSocket endpoint |

---

### Docker Compose

Starts MySQL 8 and the API gateway in containers. The frontend can be added via the `frontend` profile.

```bash
cp .env.example .env

docker-compose up -d

# Also start the frontend dev server
docker-compose --profile frontend up -d

# Apply migrations inside the container
docker-compose exec api-gateway npx prisma migrate deploy
```

---

## Environment Variables

Copy `.env.example` to `.env` and fill in the required values.

| Variable | Required | Description |
|---|:---:|---|
| `DATABASE_URL` | yes | MySQL connection string — `mysql://user:pass@host:3306/db` |
| `JWT_SECRET` | yes | Long random string used to sign JWT tokens |
| `JWT_EXPIRES_IN` | no | Token lifetime — default `7d` |
| `API_GATEWAY_PORT` | no | Backend port — default `3000` |
| `NEXT_PUBLIC_API_URL` | no | Frontend → backend URL — default `http://localhost:3000` |
| `DB_USER` / `DB_PASSWORD` / `DB_NAME` / `DB_PORT` | Docker only | Used by `docker-compose.yml` |

---

## Frontend API Layer

All communication between the Next.js frontend and the NestJS backend is centralized in **`frontend/src/lib/api.ts`**. No page or component talks to the backend directly.

### How it works

**1. Authenticated HTTP client**

One axios instance is shared across the entire app. A request interceptor reads the JWT from `localStorage` and automatically attaches it as `Authorization: Bearer <token>` to every outgoing request — no component ever handles the token manually.

**2. `gql<T>()` helper**

GraphQL always uses a single endpoint (`POST /graphql`). The `gql` helper encapsulates:
- Posting the query/mutation string and variables to `/graphql`
- Detecting GraphQL errors in the response and throwing them as standard JS `Error` objects
- Returning only the typed `data` payload

This reduces every API call to one line instead of repeating the post + error check + unwrap pattern everywhere.

**3. Field constants**

```ts
const F = {
  vehicle:      `id plateNumber type status ownerId createdAt updatedAt`,
  gps:          `id vehicleId latitude longitude speed timestamp`,
  zone:         `id name latitude longitude radius density level createdAt updatedAt`,
  incident:     `id type status description latitude longitude reportedById zoneId createdAt updatedAt`,
  notification: `id userId title message isRead type referenceId createdAt`,
};
```

GraphQL requires every requested field to be listed explicitly. `F` stores those field selections once and injects them into every query/mutation via template literals. Adding a field to a model means updating one line here.

**4. Service API objects**

| Export | Operations | Transport |
|---|---|---|
| `authApi` | `login`, `register`, `me` | GraphQL |
| `vehicleApi` | `list`, `get`, `create`, `simulate`, `movements` | GraphQL |
| `trafficApi` | `list`, `get`, `congested`, `create`, `updateDensity` | GraphQL |
| `incidentApi` | `list`, `get`, `create`, `updateStatus` | GraphQL |
| `notificationApi` | `list`, `markRead`, `send` | GraphQL |
| `adminApi` | `getUsers`, `toggleUser` | REST (only exception) |

Each method returns a clean typed value — pages receive `Vehicle[]`, `Incident`, etc., never raw GraphQL envelopes.

---

## API Reference

All operations are exposed via **GraphQL at `POST /graphql`**. The only REST surface is admin user management.

All protected operations require:
```
Authorization: Bearer <accessToken>
```

Use the **Apollo Sandbox** at `http://localhost:3000/graphql` to explore the full schema and run queries interactively.

---

### Auth (GraphQL only)

Auth has no REST controller — login, register, and session queries are GraphQL-only.

#### Register
```graphql
mutation {
  register(input: {
    email: "admin@example.com"
    password: "password123"
    firstName: "Mahmoud"
    lastName: "Belayeb"
    role: ADMIN               # optional — defaults to OPERATOR
  }) {
    accessToken
    user { id email firstName lastName role isActive }
  }
}
```

#### Login
```graphql
mutation {
  login(input: {
    email: "admin@example.com"
    password: "password123"
  }) {
    accessToken
    user { id email role }
  }
}
```

#### Get current user `🔒`
```graphql
query {
  me { id email firstName lastName role isActive }
}
```

---

### Vehicles

```graphql
# List all vehicles
query { vehicles { id plateNumber type status ownerId createdAt } }

# Single vehicle with full GPS history
query { vehicle(id: "ID") { id plateNumber positions { latitude longitude speed timestamp } } }

# GPS history only
query { vehicleHistory(vehicleId: "ID") { latitude longitude speed timestamp } }

# Register a new vehicle 🔒
mutation { createVehicle(input: {
    plateNumber: "ABC-123"
    type: CAR
    status: ACTIVE
    latitude: 36.7525
    longitude: 3.0420
  }) { id plateNumber } }

# Record / simulate a GPS position
mutation { recordGpsPosition(input: {
    vehicleId: "ID"
    latitude: 36.7530
    longitude: 3.0430
    speed: 60.0
  }) { id latitude longitude speed } }
```

> `latitude` and `longitude` are required for both create and simulate. `speed` is optional on simulate. Every position record broadcasts a `vehicle:position` WebSocket event.

---

### Traffic Zones

```graphql
# List all zones
query { trafficZones { id name latitude longitude radius density level } }

# Single zone
query { trafficZone(id: "ID") { id name density level } }

# HIGH-density zones only
query { congestedZones { id name density level } }

# Create a zone 🔒 ADMIN
mutation { createTrafficZone(input: {
    name: "Zone Nord"
    latitude: 36.76
    longitude: 3.05
    radius: 500
  }) { id name level } }

# Update density 🔒 ADMIN
mutation { updateTrafficDensity(input: { zoneId: "ID" density: 75 }) { id density level } }
```

> Density thresholds: `< 30` → `LOW` | `30–69` → `MEDIUM` | `≥ 70` → `HIGH`. Update triggers a `zone:updated` WebSocket event.

---

### Incidents

```graphql
# List all incidents
query { incidents { id type status description latitude longitude createdAt } }

# Single incident
query { incident(id: "ID") { id type status description } }

# Declare a new incident 🔒
mutation { declareIncident(input: {
    type: ACCIDENT
    description: "Collision near city hall"
    latitude: 36.7380
    longitude: 3.0870
    zoneId: "ZONE_ID"
  }) { id type status } }

# Update status 🔒 ADMIN
mutation { updateIncidentStatus(input: {
    incidentId: "ID"
    status: IN_PROGRESS
  }) { id status } }
```

> `type`: `ACCIDENT` | `CONSTRUCTION` | `ROAD_CLOSED` | `TRAFFIC_JAM`.  
> Status lifecycle: `REPORTED` → `IN_PROGRESS` → `RESOLVED`. Declaring triggers an `incident:new` WebSocket event.

---

### Notifications

```graphql
# Fetch caller's notifications — userId resolved from JWT 🔒
query { myNotifications { id title message type isRead referenceId createdAt } }

# Send a notification to a user 🔒 ADMIN
mutation { sendNotification(input: {
    userId: "TARGET_ID"
    title: "Traffic Alert"
    message: "High congestion in Zone Centre-Ville"
    type: "TRAFFIC_ALERT"
    referenceId: "ZONE_ID"
  }) { id isRead } }

# Mark a notification as read 🔒
mutation { markNotificationAsRead(id: "ID") { id isRead } }
```

> `sendNotification` delivers a `notification:new` WebSocket event to the target user's private room.

---

### Admin (REST only)

Admin user management has no GraphQL resolver. These are the only two REST endpoints in the entire application.

| Method | Endpoint | Auth | Description |
|---|---|:---:|---|
| `GET` | `/admin/users` | `🔒 ADMIN` | List all users |
| `PATCH` | `/admin/users/:id/toggle` | `🔒 ADMIN` | Toggle user active / inactive |

---

## WebSocket Events

Connect to `ws://localhost:3000` using socket.io-client.

### Client → Server

| Event | Payload | Description |
|---|---|---|
| `join` | `userId: string` | Subscribe to your personal notification room |

### Server → Client

| Event | Payload | Triggered by |
|---|---|---|
| `vehicle:position` | `{ vehicleId, latitude, longitude, speed }` | Any GPS position record (create or simulate) |
| `zone:updated` | `TrafficZone` object | Admin updates traffic density |
| `incident:new` | `Incident` object | Any user declares an incident |
| `notification:new` | `Notification` object | Admin sends a notification (room-targeted) |

### Quick connection test (browser console)

```javascript
const s = document.createElement('script');
s.src = 'https://cdn.socket.io/4.7.5/socket.io.min.js';
document.head.appendChild(s);

s.onload = () => {
  const socket = io('http://localhost:3000');

  socket.on('connect', () => {
    console.log('Connected:', socket.id);
    socket.emit('join', 'YOUR_USER_ID');
  });

  socket.on('vehicle:position', d => console.log('Vehicle moved:', d));
  socket.on('zone:updated',     d => console.log('Zone updated:', d));
  socket.on('incident:new',     d => console.log('New incident:', d));
  socket.on('notification:new', d => console.log('Notification:', d));
};
```

---

## Role-Based Access Control

Every user has one role assigned at registration (defaults to `OPERATOR`). Pass `role: ADMIN` explicitly in the `register` mutation to create an admin.

| Operation | Public | OPERATOR | ADMIN |
|---|:---:|:---:|:---:|
| `register` / `login` | ✓ | | |
| `me` | | ✓ | ✓ |
| List vehicles / zones / incidents | ✓ | | |
| Create vehicle / declare incident | | ✓ | ✓ |
| Record GPS position | ✓ | | |
| Create traffic zone | | | ✓ |
| Update traffic density | | | ✓ |
| Update incident status | | | ✓ |
| Send notification | | | ✓ |
| Get / mark notifications | | ✓ | ✓ |
| List users / toggle user | | | ✓ |

---

## Data Models

| Model | Key Fields |
|---|---|
| `User` | `id`, `email`, `firstName`, `lastName`, `role` (`ADMIN`\|`OPERATOR`), `isActive` |
| `Vehicle` | `id`, `plateNumber`, `type` (`CAR`\|`TRUCK`\|`BUS`\|`MOTORCYCLE`), `status` (`ACTIVE`\|`INACTIVE`\|`MAINTENANCE`), `ownerId` |
| `GpsPosition` | `id`, `vehicleId`, `latitude`, `longitude`, `speed?`, `timestamp` |
| `TrafficZone` | `id`, `name`, `latitude`, `longitude`, `radius`, `density`, `level` (`LOW`\|`MEDIUM`\|`HIGH`) |
| `Incident` | `id`, `type` (`ACCIDENT`\|`CONSTRUCTION`\|`ROAD_CLOSED`\|`TRAFFIC_JAM`), `status` (`REPORTED`\|`IN_PROGRESS`\|`RESOLVED`), `description`, `latitude`, `longitude`, `reportedById`, `zoneId?` |
| `Notification` | `id`, `userId`, `title`, `message`, `type`, `isRead`, `referenceId?` |

---

## CI/CD

| Workflow | Trigger | Jobs |
|---|---|---|
| **CI** (`ci.yml`) | Push / PR → `main`, `develop` | Backend lint + unit tests → backend build → frontend lint + build → Docker push (main only) |
| **Security** (`security.yml`) | Push → `main` + every Monday 08:00 UTC | `npm audit` · CodeQL analysis · Trivy container scan |

### Required GitHub Secrets

**Settings → Secrets and variables → Actions**

| Secret | Description |
|---|---|
| `JWT_SECRET` | JWT signing key |
| `MYSQL_ROOT_PASSWORD` | MySQL root password for CI |
| `MYSQL_DATABASE` | Database name for CI (e.g. `urban_traffic_test`) |

---

## Commands Reference

```bash
# ── Backend ───────────────────────────────────────────────────────
nest start api-gateway --watch   # start with hot-reload
npm run build                    # compile all NestJS apps
npm run lint                     # ESLint + auto-fix
npm run format                   # Prettier

# ── Frontend ──────────────────────────────────────────────────────
cd frontend
npm run dev                      # start Next.js dev server (port 3006)
npm run build                    # production build
npm run lint                     # Next.js ESLint

# ── Database ──────────────────────────────────────────────────────
npx prisma migrate dev           # apply schema changes
npx prisma generate              # regenerate Prisma client
npx prisma studio                # open GUI browser for the database

# ── Tests ─────────────────────────────────────────────────────────
npm test                                          # all unit tests
npm test -- --testPathPattern=vehicle-service     # single service
npm run test:cov                                  # coverage report
npm run test:watch                                # watch mode
```
