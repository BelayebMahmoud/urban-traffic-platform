// ─── Enums ────────────────────────────────────────────────────────────────────

export type Role = 'ADMIN' | 'OPERATOR';
export type VehicleType = 'CAR' | 'TRUCK' | 'BUS' | 'MOTORCYCLE';
export type VehicleStatus = 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE';
export type IncidentType =
  | 'ACCIDENT'
  | 'CONSTRUCTION'
  | 'ROAD_CLOSED'
  | 'TRAFFIC_JAM';
export type IncidentStatus = 'REPORTED' | 'IN_PROGRESS' | 'RESOLVED';
export type TrafficLevel = 'LOW' | 'MEDIUM' | 'HIGH';

// ─── Models ───────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GpsPosition {
  id: string;
  vehicleId: string;
  latitude: number;
  longitude: number;
  speed: number | null;
  timestamp: string;
}

export interface Vehicle {
  id: string;
  plateNumber: string;
  type: VehicleType;
  status: VehicleStatus;
  ownerId: string;
  positions?: GpsPosition[];
  createdAt: string;
  updatedAt: string;
}

export interface TrafficZone {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radius: number;
  density: number;
  level: TrafficLevel;
  createdAt: string;
  updatedAt: string;
}

export interface Incident {
  id: string;
  type: IncidentType;
  status: IncidentStatus;
  description: string;
  latitude: number;
  longitude: number;
  reportedById: string;
  zoneId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

// ─── Stats ────────────────────────────────────────────────────────────────────

export interface DashboardStats {
  totalVehicles: number;
  activeVehicles: number;
  totalIncidents: number;
  openIncidents: number;
  trafficZones: number;
  highDensityZones: number;
  unreadNotifications: number;
}
