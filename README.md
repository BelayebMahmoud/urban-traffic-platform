# Urban Traffic Platform

[![CI](https://github.com/MahmoudBELAYEB/urban-traffic-platform/actions/workflows/ci.yml/badge.svg)](https://github.com/MahmoudBELAYEB/urban-traffic-platform/actions/workflows/ci.yml)
[![Security Scan](https://github.com/MahmoudBELAYEB/urban-traffic-platform/actions/workflows/security.yml/badge.svg)](https://github.com/MahmoudBELAYEB/urban-traffic-platform/actions/workflows/security.yml)

A NestJS monorepo for urban traffic management exposing a single **GraphQL API** and real-time **WebSocket** events.

---

## Architecture

```
Frontend / API Client
        │
        ▼  HTTP :3000/graphql   WS :3000
  ┌─────────────────────────────────────┐
  │           API Gateway               │
  │  GraphQL Schema (code-first)        │
  │  WebSocket Gateway (socket.io)      │
  └──┬──────┬────────┬────────┬─────────┘
     │      │        │        │        │
   Auth  Vehicle  Traffic  Incident  Notification
   Svc    Svc      Svc      Svc       Svc
     │      │        │        │        │
     └──────┴────────┴────────┴────────┘
                     │
               Prisma ORM
                     │
              MySQL Database
```

All services are NestJS modules imported into the single gateway process. There is **one HTTP port** (3000) for both GraphQL and WebSocket — the frontend never needs to talk to individual service ports.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | NestJS 11 |
| API | GraphQL code-first — Apollo Server 5 |
| Real-time | socket.io / @nestjs/websockets |
| ORM | Prisma 6 |
| Database | MySQL 8 (XAMPP / phpMyAdmin) |
| Auth | JWT — passport-jwt + bcryptjs |
| Validation | class-validator |
| Testing | Jest |

---

## Prerequisites

- Node.js 18+
- XAMPP running (MySQL on port 3306, phpMyAdmin accessible)

---

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Create the database

Open phpMyAdmin → create a new database named `urban_traffic`.

### 3. Configure environment

Create a `.env` file at the project root:

```env
DATABASE_URL=mysql://root:@localhost:3306/urban_traffic
JWT_SECRET=urban-traffic-super-secret-2024
JWT_EXPIRES_IN=7d

API_GATEWAY_PORT=3000
AUTH_SERVICE_PORT=3001
VEHICLE_SERVICE_PORT=3002
TRAFFIC_SERVICE_PORT=3003
INCIDENT_SERVICE_PORT=3004
NOTIFICATION_SERVICE_PORT=3005
```

> If your MySQL root user has a password: `mysql://root:YOUR_PASSWORD@localhost:3306/urban_traffic`

### 4. Run database migration

```bash
npx prisma migrate dev --name init
```

### 5. Start the server

```bash
nest start api-gateway --watch
```

The server is ready at:
- GraphQL playground: `http://localhost:3000/graphql`
- WebSocket: `ws://localhost:3000`

---

## Project Structure

```
apps/
  api-gateway/           Port 3000 — single entry point for GraphQL + WebSocket
  auth-service/          register, login, JWT issuance
  vehicle-service/       vehicle CRUD + GPS position recording
  traffic-service/       traffic zone management + density classification
  incident-service/      incident reporting + status lifecycle
  notification-service/  per-user notifications + read tracking
libs/
  common/                JwtAuthGuard, RolesGuard, @CurrentUser decorator,
                         JwtStrategy, EventsGateway (shared WebSocket emitter)
  prisma-client/         global PrismaClientService (injected everywhere)
prisma/
  schema.prisma          single schema for all services
```

---

## Data Models

| Model | Key Fields |
|---|---|
| `User` | `id`, `email`, `firstName`, `lastName`, `role` (`ADMIN` \| `OPERATOR`), `isActive` |
| `Vehicle` | `id`, `plateNumber`, `type` (`CAR` `TRUCK` `BUS` `MOTORCYCLE`), `status` (`ACTIVE` `INACTIVE` `MAINTENANCE`), `ownerId` |
| `GpsPosition` | `id`, `vehicleId`, `latitude`, `longitude`, `speed`, `timestamp` |
| `TrafficZone` | `id`, `name`, `latitude`, `longitude`, `radius`, `density`, `level` (`LOW` `MEDIUM` `HIGH`) |
| `Incident` | `id`, `type` (`ACCIDENT` `CONSTRUCTION` `ROAD_CLOSED` `TRAFFIC_JAM`), `status` (`REPORTED` `IN_PROGRESS` `RESOLVED`), `description`, `latitude`, `longitude`, `reportedById`, `zoneId` |
| `Notification` | `id`, `userId`, `title`, `message`, `type`, `isRead`, `referenceId` |

---

## Role-Based Access Control

Every user has one of two roles assigned at registration (defaults to `OPERATOR`).

| Operation | Public | OPERATOR | ADMIN |
|---|:---:|:---:|:---:|
| `register` / `login` | yes | — | — |
| `me` | — | yes | yes |
| `vehicles` / `vehicle` | — | yes | yes |
| `createVehicle` | — | yes | yes |
| `recordGpsPosition` / `vehicleHistory` | — | yes | yes |
| `trafficZones` / `trafficZone` / `congestedZones` | yes | — | — |
| `createTrafficZone` | — | **no** | yes |
| `updateTrafficDensity` | — | **no** | yes |
| `incidents` / `incident` | yes | — | — |
| `declareIncident` | — | yes | yes |
| `updateIncidentStatus` | — | **no** | yes |
| `myNotifications` / `markNotificationAsRead` | — | yes | yes |
| `sendNotification` | — | **no** | yes |

> **To make a user ADMIN:** register normally (role defaults to OPERATOR), then open phpMyAdmin → `User` table → edit the row → set `role = ADMIN`.

---

## GraphQL API Reference

### Authentication header

All protected operations require this HTTP header:

```
Authorization: Bearer <accessToken>
```

---

### Auth Service

#### Register
```graphql
mutation {
  register(input: {
    email: "admin@test.com"
    password: "password123"      # min 8 characters
    firstName: "Mahmoud"
    lastName: "Belayeb"
    role: ADMIN                  # optional — defaults to OPERATOR.
  }) {
    accessToken
    user {
      id
      email
      firstName
      lastName
      role
    }
  }
}
```

#### Login
```graphql
mutation {
  login(input: {
    email: "admin@test.com"
    password: "password123"
  }) {
    accessToken
    user { id email role }
  }
}
```

#### Get current user — requires token
```graphql
query {
  me {
    id
    email
    firstName
    lastName
    role
    isActive
    createdAt
  }
}
```

---

### Vehicle Service — all operations require token

#### Create a vehicle
```graphql
mutation {
  createVehicle(input: {
    plateNumber: "ABC-123"
    type: CAR               # CAR | TRUCK | BUS | MOTORCYCLE
    status: ACTIVE          # ACTIVE | INACTIVE | MAINTENANCE
  }) {
    id
    plateNumber
    type
    status
    ownerId
    createdAt
  }
}
```

#### List all vehicles
```graphql
query {
  vehicles {
    id
    plateNumber
    type
    status
    ownerId
  }
}
```

#### Get one vehicle
```graphql
query {
  vehicle(id: "VEHICLE_ID") {
    id
    plateNumber
    type
    status
  }
}
```

#### Record a GPS position (simulate movement)
```graphql
# All coordinate fields are optional — omit them to let the server
# generate a random nudge from the last recorded position.
mutation {
  recordGpsPosition(input: {
    vehicleId: "VEHICLE_ID"
    latitude: 36.7525         # optional
    longitude: 3.0420         # optional
    speed: 60.0               # optional, km/h
  }) {
    id
    latitude
    longitude
    speed
    timestamp
  }
}
```

#### Get movement history
```graphql
query {
  vehicleHistory(vehicleId: "VEHICLE_ID") {
    id
    latitude
    longitude
    speed
    timestamp
  }
}
```

---

### Traffic Service

#### List all zones — public
```graphql
query {
  trafficZones {
    id
    name
    latitude
    longitude
    radius
    density
    level
  }
}
```

#### Get one zone — public
```graphql
query {
  trafficZone(id: "ZONE_ID") {
    id name density level
  }
}
```

#### List HIGH congestion zones — public
```graphql
query {
  congestedZones {
    id
    name
    density
    level
  }
}
```

#### Create a zone — ADMIN only
```graphql
mutation {
  createTrafficZone(input: {
    name: "Zone Nord"
    latitude: 36.7600
    longitude: 3.0500
    radius: 500               # meters
  }) {
    id
    name
    density
    level
  }
}
```

#### Update density — ADMIN only
```graphql
# Density classification: < 30 → LOW | 30–69 → MEDIUM | ≥ 70 → HIGH
mutation {
  updateTrafficDensity(input: {
    zoneId: "ZONE_ID"
    density: 75
  }) {
    id
    name
    density
    level                     # automatically set to HIGH
  }
}
```

---

### Incident Service

#### List all incidents — public
```graphql
query {
  incidents {
    id
    type
    status
    description
    latitude
    longitude
    reportedById
    createdAt
  }
}
```

#### Get one incident — public
```graphql
query {
  incident(id: "INCIDENT_ID") {
    id type status description createdAt
  }
}
```

#### Declare an incident — requires token
```graphql
mutation {
  declareIncident(input: {
    type: ACCIDENT            # ACCIDENT | CONSTRUCTION | ROAD_CLOSED | TRAFFIC_JAM
    description: "Collision on main road"
    latitude: 36.7400
    longitude: 3.0900
    zoneId: "ZONE_ID"         # optional
  }) {
    id
    type
    status                    # always REPORTED on creation
    reportedById
  }
}
```

#### Update incident status — ADMIN only
```graphql
mutation {
  updateIncidentStatus(input: {
    incidentId: "INCIDENT_ID"
    status: IN_PROGRESS       # REPORTED | IN_PROGRESS | RESOLVED
  }) {
    id
    status
  }
}
```

---

### Notification Service

#### Send a notification — ADMIN only
```graphql
mutation {
  sendNotification(input: {
    userId: "TARGET_USER_ID"
    title: "Traffic Alert"
    message: "High congestion detected in Zone Nord"
    type: "TRAFFIC_ALERT"     # free string — e.g. TRAFFIC_ALERT | INCIDENT | SYSTEM
    referenceId: "ZONE_ID"    # optional, link to related entity
  }) {
    id
    title
    message
    isRead
    createdAt
  }
}
```

#### Get my notifications — requires token
```graphql
query {
  myNotifications {
    id
    title
    message
    type
    isRead
    referenceId
    createdAt
  }
}
```

#### Mark notification as read — requires token
```graphql
mutation {
  markNotificationAsRead(id: "NOTIFICATION_ID") {
    id
    isRead
  }
}
```

---

## WebSocket Events

Connect to `ws://localhost:3000` using socket.io-client.

### Client → Server

| Event | Payload | Description |
|---|---|---|
| `join` | `userId: string` | Join the personal room to receive targeted notifications |

### Server → Client

| Event | Payload | Triggered by |
|---|---|---|
| `incident:new` | `Incident` object | Any user declares an incident |
| `zone:updated` | `TrafficZone` object | Admin updates a zone's traffic density |
| `notification:new` | `Notification` object | Admin sends a notification to this user |

### Quick connection test (browser console)

```javascript
// Inject socket.io client
const s = document.createElement('script');
s.src = 'https://cdn.socket.io/4.7.5/socket.io.min.js';
document.head.appendChild(s);

s.onload = () => {
  const socket = io('http://localhost:3000');

  socket.on('connect', () => {
    console.log('Connected:', socket.id);
    socket.emit('join', 'YOUR_USER_ID');  // replace with real user ID
  });

  socket.on('incident:new',      data => console.log('New incident:', data));
  socket.on('zone:updated',      data => console.log('Zone updated:', data));
  socket.on('notification:new',  data => console.log('Notification:', data));
};
```

---

## Complete Demo Scenario

### Step 1 — Register users

```graphql
# Register OPERATOR (default role)
mutation {
  register(input: {
    email: "operator@test.com"
    password: "password123"
    firstName: "Karim"
    lastName: "Benali"
  }) {
    token
    user { id email role }
  }
}
```

```graphql
# Register future ADMIN
mutation {
  register(input: {
    email: "admin@test.com"
    password: "password123"
    firstName: "Sara"
    lastName: "Admin"
  }) {
    token
    user { id email role }
  }
}
```

Then open **phpMyAdmin → urban_traffic → User** and set `role = ADMIN` for `admin@test.com`.

### Step 2 — Login both users

```graphql
mutation { login(input: { email: "admin@test.com",    password: "password123" }) { accessToken } }
mutation { login(input: { email: "operator@test.com", password: "password123" }) { accessToken } }
```

Save both tokens.

### Step 3 — Connect WebSocket listener

Paste the browser console script above (Step 2 of WebSocket section) and keep the tab open.

### Step 4 — ADMIN creates a traffic zone

Set **ADMIN token** in playground headers.

```graphql
mutation {
  createTrafficZone(input: {
    name: "Zone Centre-Ville"
    latitude: 36.7372
    longitude: 3.0865
    radius: 800
  }) {
    id name level density
  }
}
```

Save the `id` as `ZONE_ID`.

### Step 5 — OPERATOR declares an incident → WebSocket fires

Switch to **OPERATOR token**.

```graphql
mutation {
  declareIncident(input: {
    type: ACCIDENT
    description: "Collision between two vehicles near the city hall"
    latitude: 36.7380
    longitude: 3.0870
    zoneId: "ZONE_ID"
  }) {
    id type status
  }
}
```

The browser console prints `🚨 New incident: { id, type: "ACCIDENT", status: "REPORTED", ... }`

Save the incident `id` as `INCIDENT_ID`.

### Step 6 — OPERATOR tries to update incident status → 403

Still with **OPERATOR token**:

```graphql
mutation {
  updateIncidentStatus(input: { incidentId: "INCIDENT_ID", status: IN_PROGRESS }) {
    id status
  }
}
```

**Expected:** `"Forbidden resource"` — RBAC working correctly.

### Step 7 — ADMIN updates status and density → WebSocket fires

Switch to **ADMIN token**.

```graphql
mutation {
  updateIncidentStatus(input: { incidentId: "INCIDENT_ID", status: IN_PROGRESS }) {
    id status
  }
}
```

```graphql
mutation {
  updateTrafficDensity(input: { zoneId: "ZONE_ID", density: 80 }) {
    id name density level
  }
}
```

Console prints `🗺️ Zone updated: { level: "HIGH", density: 80, ... }`

### Step 8 — ADMIN notifies the operator → WebSocket fires on their room

```graphql
mutation {
  sendNotification(input: {
    userId: "OPERATOR_USER_ID"
    title: "Incident in Progress"
    message: "Accident near city hall, dispatch requested"
    type: "INCIDENT"
    referenceId: "INCIDENT_ID"
  }) {
    id title isRead
  }
}
```

Console prints `🔔 Notification: { title: "Incident in Progress", isRead: false, ... }` (only on the operator's socket room).

### Step 9 — Operator reads notifications

Switch to **OPERATOR token**.

```graphql
query { myNotifications { id title message isRead createdAt } }

mutation { markNotificationAsRead(id: "NOTIFICATION_ID") { id isRead } }
```

### Step 10 — Resolve the incident

Switch to **ADMIN token**.

```graphql
mutation {
  updateIncidentStatus(input: { incidentId: "INCIDENT_ID", status: RESOLVED }) {
    id status
  }
}
```

---

## CI/CD

| Workflow | Trigger | Purpose |
|---|---|---|
| **CI** (`ci.yml`) | Push / PR to `main` or `develop` | Lint → unit tests → build → Docker push (main only) |
| **CD** (`cd.yml`) | After CI succeeds on `main` | Deploy frontend to GitHub Pages, backend to VPS via SSH |
| **Security** (`security.yml`) | Push to `main` + every Monday 08:00 UTC | `npm audit`, CodeQL static analysis, Trivy container scan |

### Required GitHub Secrets

Go to **Settings → Secrets and variables → Actions** and add:

| Secret | Description |
|---|---|
| `JWT_SECRET` | JWT signing key (any long random string) |
| `MYSQL_ROOT_PASSWORD` | MySQL root password for CI integration tests |
| `MYSQL_DATABASE` | Database name for CI (e.g. `urban_traffic_test`) |
| `DEPLOY_HOST` | VPS hostname or IP |
| `DEPLOY_USER` | SSH user on the VPS |
| `DEPLOY_KEY` | SSH private key for VPS access |

---

## Commands Reference

```bash
# Start the platform
nest start api-gateway --watch

# Database
npx prisma migrate dev        # apply schema changes
npx prisma generate           # regenerate Prisma client after schema edit
npx prisma studio             # GUI browser for the database

# Tests
npm test                                            # all unit tests
npm test -- --testPathPattern=vehicle-service       # single service
npm run test:cov                                    # coverage report

# Code quality
npm run lint                  # ESLint + auto-fix
npm run format                # Prettier
npm run build                 # compile all apps
```
