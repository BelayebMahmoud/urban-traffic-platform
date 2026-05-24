export type VehicleType = 'CAR' | 'BUS' | 'MOTORBIKE' | 'TRUCK' | 'EMERGENCY';

export type VehicleStatus = 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE';

export interface GpsPosition {
  id: string;
  vehicleId: string;
  latitude: number;
  longitude: number;
  speed?: number;
  timestamp: string;
  simulated: boolean;
}

export interface Vehicle {
  id: string;
  plateNumber: string;
  type: VehicleType;
  status: VehicleStatus;
  ownerName: string;
  createdAt: string;
  updatedAt: string;
}

export interface VehicleDetails extends Vehicle {
  latestPosition: GpsPosition | null;
  totalPositions: number;
}
