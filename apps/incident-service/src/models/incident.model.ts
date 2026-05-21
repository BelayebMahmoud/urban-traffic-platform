export type IncidentType =
  | 'ACCIDENT'
  | 'CONSTRUCTION'
  | 'ROAD_CLOSED'
  | 'TRAFFIC_JAM';

export type IncidentStatus = 'REPORTED' | 'IN_PROGRESS' | 'RESOLVED';

export interface Incident {
  id: string;
  type: IncidentType;
  status: IncidentStatus;
  description: string;
  latitude: number;
  longitude: number;
  reportedBy: string;
  createdAt: string;
  updatedAt: string;
}
