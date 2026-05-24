import axios from 'axios';

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

const http = axios.create({ baseURL: BASE, timeout: 8000 });

// Attach stored JWT token to every request
http.interceptors.request.use(config => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('auth_token');
        if (token) config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// ─── Vehicles ─────────────────────────────────────────────────────────────────

export const vehicleApi = {
    list: () => http.get('/vehicles').then(r => r.data),
    get: (id: string) => http.get(`/vehicles/${id}`).then(r => r.data),
    create: (body: { plateNumber: string; type: string; status: string }) =>
        http.post('/vehicles', body).then(r => r.data),
    simulate: (id: string, body: { latitude?: number; longitude?: number; speed?: number }) =>
        http.post(`/vehicles/${id}/positions/simulate`, body).then(r => r.data),
    movements: (id: string) => http.get(`/vehicles/${id}/movements`).then(r => r.data),
};

// ─── Incidents ────────────────────────────────────────────────────────────────

export const incidentApi = {
    list: () => http.get('/incidents').then(r => r.data),
    get: (id: string) => http.get(`/incidents/${id}`).then(r => r.data),
    create: (body: {
        type: string; description: string;
        latitude: number; longitude: number;
        zoneId?: string;
    }) => http.post('/incidents', body).then(r => r.data),
    updateStatus: (id: string, status: string) =>
        http.patch(`/incidents/${id}/status`, { status }).then(r => r.data),
};

// ─── Traffic Zones ────────────────────────────────────────────────────────────

export const trafficApi = {
    list: () => http.get('/traffic-zones').then(r => r.data),
    get: (id: string) => http.get(`/traffic-zones/${id}`).then(r => r.data),
    congested: () => http.get('/traffic-zones/congested').then(r => r.data),
    create: (body: { name: string; latitude: number; longitude: number; radius: number }) =>
        http.post('/traffic-zones', body).then(r => r.data),
    updateDensity: (zoneId: string, density: number) =>
        http.patch('/traffic-zones/density', { zoneId, density }).then(r => r.data),
};

// ─── Notifications ────────────────────────────────────────────────────────────

export const notificationApi = {
    list: (userId: string) => http.get(`/notifications/${userId}`).then(r => r.data),
    markRead: (id: string) => http.patch(`/notifications/${id}/read`).then(r => r.data),
    send: (body: { userId: string; title: string; message: string; type?: string }) =>
        http.post('/notifications', body).then(r => r.data),
};

// ─── Admin ────────────────────────────────────────────────────────────────────

export const adminApi = {
    getUsers: () => http.get('/admin/users').then(r => r.data),
    toggleUser: (id: string) => http.patch(`/admin/users/${id}/toggle`).then(r => r.data),
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

async function gql<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    const res = await http.post('/graphql', { query, variables }, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (res.data.errors?.length) {
        throw Object.assign(new Error(res.data.errors[0].message), {
            response: { data: { message: res.data.errors[0].message } },
        });
    }
    return res.data.data as T;
}

export const authApi = {
    login: async (email: string, password: string) => {
        const data = await gql<{ login: { accessToken: string; user: any } }>(
            GQL_LOGIN, { input: { email, password } },
        );
        return data.login;
    },
    register: async (body: { email: string; password: string; firstName: string; lastName: string }) => {
        const data = await gql<{ register: { accessToken: string; user: any } }>(
            GQL_REGISTER, { input: body },
        );
        return data.register;
    },
    me: async () => {
        const data = await gql<{ me: any }>(GQL_ME);
        return data.me;
    },
};
