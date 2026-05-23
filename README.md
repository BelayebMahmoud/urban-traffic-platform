# Urban Traffic Platform

A distributed platform for urban traffic management built with NestJS, GraphQL, and MySQL.

The platform allows supervision of vehicles, detection of traffic incidents, and analysis of traffic circulation through a single GraphQL API Gateway that aggregates five independent microservices.

---

## Architecture

```
Client (Apollo Sandbox / Postman)
             │
             ▼  http://localhost:3000/graphql
       API Gateway  ← single GraphQL entry point
             │
    ┌────────┼──────────────────────┐
    │        │           │          │
  Auth    Vehicle    Traffic    Incident   Notification
 Service  Service    Service    Service     Service
    │        │           │          │          │
    └────────┴───────────┴──────────┴──────────┘
                         │
                    Prisma ORM
                         │
                    MySQL Database
```

All services are NestJS modules imported into the API Gateway. A single GraphQL schema is built automatically from all resolvers.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | NestJS 11 |
| API | GraphQL (code-first) — Apollo Server 5 |
| ORM | Prisma 6 |
| Database | MySQL (phpMyAdmin) |
| Auth | Passport JWT + bcryptjs |
| Validation | class-validator |
| Testing | Jest |

---

## Prerequisites

- Node.js 18+
- MySQL running on port 3306 (XAMPP / phpMyAdmin)

---

## Setup

**1. Install dependencies**
```bash
npm install
```

**2. Configure environment**

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

**3. Create the database**

Open phpMyAdmin and create a database named `urban_traffic`.

**4. Run migrations**
```bash
npx prisma migrate dev --name init
```

**5. Start the gateway**
```bash
nest start api-gateway --watch
```

GraphQL playground: `http://localhost:3000/graphql`

---

## Project Structure

```
apps/
  api-gateway/           Port 3000 — GraphQL entry point, imports all modules
  auth-service/          Port 3001 — register, login, JWT
  vehicle-service/       Port 3002 — vehicle CRUD + GPS simulation
  traffic-service/       Port 3003 — traffic zones + density classification
  incident-service/      Port 3004 — incident reporting + status tracking
  notification-service/  Port 3005 — user notifications
libs/
  common/                JWT strategy, guards (@JwtAuthGuard), decorators (@CurrentUser)
  prisma-client/         Global Prisma client shared across all services
prisma/
  schema.prisma          Single database schema for all services
```

---

## Data Models

| Model | Key Fields |
|---|---|
| `User` | email, password (hashed), role (`ADMIN` \| `OPERATOR`) |
| `Vehicle` | plateNumber, type (`CAR` `TRUCK` `BUS` `MOTORCYCLE`), status, ownerId |
| `GpsPosition` | vehicleId, latitude, longitude, speed, timestamp |
| `TrafficZone` | name, latitude, longitude, radius, density, level (`LOW` `MEDIUM` `HIGH`) |
| `Incident` | type, status (`REPORTED` `IN_PROGRESS` `RESOLVED`), description, reportedById |
| `Notification` | userId, title, message, isRead, type |

---

## GraphQL API

### Authentication

```graphql
# Register
mutation {
  register(input: {
    email: "admin@example.com"
    password: "password123"
    firstName: "John"
    lastName: "Doe"
    role: ADMIN
  }) {
    accessToken
    user { id email role }
  }
}

# Login
mutation {
  login(input: { email: "admin@example.com", password: "password123" }) {
    accessToken
  }
}

# Get current user  [requires token]
query {
  me { id email firstName lastName role }
}
```

> All protected operations require the header:
> `Authorization: Bearer <accessToken>`

### Vehicles

```graphql
mutation {
  createVehicle(input: { plateNumber: "ABC-123", type: CAR, status: ACTIVE }) {
    id plateNumber type status
  }
}

query { vehicles { id plateNumber type status } }

query {
  vehicle(id: "VEHICLE_ID") {
    plateNumber
    positions { latitude longitude speed timestamp }
  }
}

mutation {
  recordGpsPosition(input: { vehicleId: "VEHICLE_ID" }) {
    latitude longitude speed timestamp
  }
}

query { vehicleHistory(vehicleId: "VEHICLE_ID") { latitude longitude speed timestamp } }
```

### Traffic Zones

```graphql
mutation {
  createTrafficZone(input: {
    name: "City Center"
    latitude: 36.7372
    longitude: 3.0865
    radius: 500
  }) {
    id name level
  }
}

# density < 30 → LOW | 30-69 → MEDIUM | ≥ 70 → HIGH
mutation {
  updateTrafficDensity(input: { zoneId: "ZONE_ID", density: 75 }) {
    id name density level
  }
}

query { trafficZones { id name density level } }
query { congestedZones { id name density } }
```

### Incidents

```graphql
mutation {
  declareIncident(input: {
    type: ACCIDENT
    description: "Collision on main road"
    latitude: 36.740
    longitude: 3.090
  }) {
    id type status
  }
}

query { incidents { id type status description createdAt } }

mutation {
  updateIncidentStatus(input: { incidentId: "ID", status: IN_PROGRESS }) {
    id status
  }
}
```

### Notifications

```graphql
mutation {
  sendNotification(input: {
    userId: "USER_ID"
    title: "Traffic Alert"
    message: "High congestion detected"
    type: "TRAFFIC_ALERT"
  }) {
    id title
  }
}

query { myNotifications { id title message isRead createdAt } }

mutation { markNotificationAsRead(id: "NOTIFICATION_ID") { id isRead } }
```

---

## Tests

```bash
# Run all unit tests
npm test

# Run tests for a specific service
npm test -- --testPathPattern=vehicle-service

# Coverage report
npm run test:cov
```

---

## Available Commands

```bash
nest start api-gateway --watch   # Start the platform
npx prisma migrate dev           # Apply database migrations
npx prisma studio                # Open Prisma database UI
npm run lint                     # Lint and auto-fix
npm run build                    # Build all apps
```
