import axios from 'axios';
import type {
  GpsPosition,
  Incident,
  Notification,
  TrafficZone,
  Vehicle,
} from '@/types';

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

const http = axios.create({ baseURL: BASE, timeout: 8000 });

// Attach stored JWT to every request (REST and GraphQL)
http.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── GraphQL helper ───────────────────────────────────────────────────────────

async function gql<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
  const res = await http.post('/graphql', { query, variables });
  if (res.data.errors?.length) {
    throw Object.assign(new Error(res.data.errors[0].message), {
      response: { data: { message: res.data.errors[0].message } },
    });
  }
  return res.data.data as T;
}

// Shared field selections — keep in sync with GQL ObjectType models
const F = {
  vehicle:      `id plateNumber type status ownerId createdAt updatedAt`,
  gps:          `id vehicleId latitude longitude speed timestamp`,
  zone:         `id name latitude longitude radius density level createdAt updatedAt`,
  incident:     `id type status description latitude longitude reportedById zoneId createdAt updatedAt`,
  notification: `id userId title message isRead type referenceId createdAt`,
};

// ─── Vehicles ─────────────────────────────────────────────────────────────────

export const vehicleApi = {
  list: () =>
    gql<{ vehicles: Vehicle[] }>(`query { vehicles { ${F.vehicle} } }`)
      .then((d) => d.vehicles),

  get: (id: string) =>
    gql<{ vehicle: Vehicle }>(
      `query Vehicle($id: ID!) {
         vehicle(id: $id) { ${F.vehicle} positions { ${F.gps} } }
       }`,
      { id },
    ).then((d) => d.vehicle),

  create: (body: {
    plateNumber: string;
    type: string;
    status: string;
    latitude: number;
    longitude: number;
  }) =>
    gql<{ createVehicle: Vehicle }>(
      `mutation CreateVehicle($input: CreateVehicleInput!) {
         createVehicle(input: $input) { ${F.vehicle} }
       }`,
      { input: body },
    ).then((d) => d.createVehicle),

  simulate: (id: string, body: { latitude: number; longitude: number; speed?: number }) =>
    gql<{ recordGpsPosition: GpsPosition }>(
      `mutation RecordGpsPosition($input: SimulatePositionInput!) {
         recordGpsPosition(input: $input) { ${F.gps} }
       }`,
      { input: { vehicleId: id, ...body } },
    ).then((d) => d.recordGpsPosition),

  movements: (id: string) =>
    gql<{ vehicleHistory: GpsPosition[] }>(
      `query VehicleHistory($vehicleId: ID!) {
         vehicleHistory(vehicleId: $vehicleId) { ${F.gps} }
       }`,
      { vehicleId: id },
    ).then((d) => d.vehicleHistory),
};

// ─── Traffic Zones ────────────────────────────────────────────────────────────

export const trafficApi = {
  list: () =>
    gql<{ trafficZones: TrafficZone[] }>(`query { trafficZones { ${F.zone} } }`)
      .then((d) => d.trafficZones),

  get: (id: string) =>
    gql<{ trafficZone: TrafficZone }>(
      `query TrafficZone($id: ID!) { trafficZone(id: $id) { ${F.zone} } }`,
      { id },
    ).then((d) => d.trafficZone),

  congested: () =>
    gql<{ congestedZones: TrafficZone[] }>(`query { congestedZones { ${F.zone} } }`)
      .then((d) => d.congestedZones),

  create: (body: { name: string; latitude: number; longitude: number; radius: number }) =>
    gql<{ createTrafficZone: TrafficZone }>(
      `mutation CreateTrafficZone($input: CreateZoneInput!) {
         createTrafficZone(input: $input) { ${F.zone} }
       }`,
      { input: body },
    ).then((d) => d.createTrafficZone),

  updateDensity: (zoneId: string, density: number) =>
    gql<{ updateTrafficDensity: TrafficZone }>(
      `mutation UpdateDensity($input: UpdateDensityInput!) {
         updateTrafficDensity(input: $input) { ${F.zone} }
       }`,
      { input: { zoneId, density } },
    ).then((d) => d.updateTrafficDensity),
};

// ─── Incidents ────────────────────────────────────────────────────────────────

export const incidentApi = {
  list: () =>
    gql<{ incidents: Incident[] }>(`query { incidents { ${F.incident} } }`)
      .then((d) => d.incidents),

  get: (id: string) =>
    gql<{ incident: Incident }>(
      `query Incident($id: ID!) { incident(id: $id) { ${F.incident} } }`,
      { id },
    ).then((d) => d.incident),

  create: (body: {
    type: string;
    description: string;
    latitude: number;
    longitude: number;
    zoneId?: string;
  }) =>
    gql<{ declareIncident: Incident }>(
      `mutation DeclareIncident($input: CreateIncidentInput!) {
         declareIncident(input: $input) { ${F.incident} }
       }`,
      { input: body },
    ).then((d) => d.declareIncident),

  updateStatus: (id: string, status: string) =>
    gql<{ updateIncidentStatus: Incident }>(
      `mutation UpdateIncidentStatus($input: UpdateIncidentStatusInput!) {
         updateIncidentStatus(input: $input) { ${F.incident} }
       }`,
      { input: { incidentId: id, status } },
    ).then((d) => d.updateIncidentStatus),
};

// ─── Notifications ────────────────────────────────────────────────────────────

export const notificationApi = {
  // myNotifications reads userId from the JWT — no argument needed
  list: () =>
    gql<{ myNotifications: Notification[] }>(`query { myNotifications { ${F.notification} } }`)
      .then((d) => d.myNotifications),

  markRead: (id: string) =>
    gql<{ markNotificationAsRead: Notification }>(
      `mutation MarkRead($id: ID!) { markNotificationAsRead(id: $id) { id isRead } }`,
      { id },
    ).then((d) => d.markNotificationAsRead),

  send: (body: { userId: string; title: string; message: string; type?: string }) =>
    gql<{ sendNotification: Notification }>(
      `mutation SendNotification($input: SendNotificationInput!) {
         sendNotification(input: $input) { ${F.notification} }
       }`,
      { input: { type: 'GENERAL', ...body } },
    ).then((d) => d.sendNotification),
};

// ─── Admin (REST only — no GraphQL resolver exists) ───────────────────────────

export const adminApi = {
  getUsers: () => http.get('/admin/users').then((r) => r.data),
  toggleUser: (id: string) => http.patch(`/admin/users/${id}/toggle`).then((r) => r.data),
};

// ─── Auth (GraphQL) ───────────────────────────────────────────────────────────

const GQL_LOGIN = `
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      accessToken
      user { id email firstName lastName role isActive }
    }
  }
`;

const GQL_REGISTER = `
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      accessToken
      user { id email firstName lastName role isActive }
    }
  }
`;

const GQL_ME = `
  query Me {
    me { id email firstName lastName role isActive }
  }
`;

export const authApi = {
  login: async (email: string, password: string) => {
    const data = await gql<{ login: { accessToken: string; user: any } }>(
      GQL_LOGIN,
      { input: { email, password } },
    );
    return data.login;
  },
  register: async (body: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) => {
    const data = await gql<{ register: { accessToken: string; user: any } }>(
      GQL_REGISTER,
      { input: body },
    );
    return data.register;
  },
  me: async () => {
    const data = await gql<{ me: any }>(GQL_ME);
    return data.me;
  },
};
