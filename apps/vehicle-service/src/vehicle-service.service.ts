import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { SimulatePositionDto } from './dto/simulate-position.dto';
import { GpsPosition, Vehicle, VehicleDetails } from './models/vehicle.model';

@Injectable()
export class VehicleServiceService {
  private readonly vehicles = new Map<string, Vehicle>();
  private readonly positionsByVehicle = new Map<string, GpsPosition[]>();

  addVehicle(dto: CreateVehicleDto): Vehicle {
    const normalizedPlate = dto.plateNumber.trim().toUpperCase();
    const existingVehicle = [...this.vehicles.values()].find(
      (vehicle) => vehicle.plateNumber === normalizedPlate,
    );

    if (existingVehicle) {
      throw new BadRequestException('A vehicle with this plate number already exists.');
    }

    const now = new Date().toISOString();
    const vehicle: Vehicle = {
      id: randomUUID(),
      plateNumber: normalizedPlate,
      type: dto.type,
      status: dto.status,
      ownerName: dto.ownerName.trim(),
      createdAt: now,
      updatedAt: now,
    };

    this.vehicles.set(vehicle.id, vehicle);
    this.positionsByVehicle.set(vehicle.id, []);

    return vehicle;
  }

  getVehicles(): Vehicle[] {
    return [...this.vehicles.values()];
  }

  getVehicleDetails(vehicleId: string): VehicleDetails {
    const vehicle = this.getVehicleOrThrow(vehicleId);
    const history = this.getSortedHistory(vehicleId);
    const latestPosition = history[history.length - 1] ?? null;

    return {
      ...vehicle,
      latestPosition,
      totalPositions: history.length,
    };
  }

  saveSimulatedPosition(vehicleId: string, dto: SimulatePositionDto): GpsPosition {
    const vehicle = this.getVehicleOrThrow(vehicleId);
    const history = this.positionsByVehicle.get(vehicleId) ?? [];

    const previous = history[history.length - 1];
    const latitude = dto.latitude ?? this.getRandomCoordinate(previous?.latitude, -90, 90);
    const longitude =
      dto.longitude ?? this.getRandomCoordinate(previous?.longitude, -180, 180);
    const speed = dto.speed ?? this.getRandomSpeed(previous?.speed);

    const position: GpsPosition = {
      id: randomUUID(),
      vehicleId,
      latitude,
      longitude,
      speed,
      timestamp: new Date().toISOString(),
      simulated: true,
    };

    history.push(position);
    this.positionsByVehicle.set(vehicleId, history);
    this.vehicles.set(vehicleId, {
      ...vehicle,
      updatedAt: new Date().toISOString(),
    });

    return position;
  }

  getMovementHistory(vehicleId: string): GpsPosition[] {
    this.getVehicleOrThrow(vehicleId);
    return this.getSortedHistory(vehicleId);
  }

  private getVehicleOrThrow(vehicleId: string): Vehicle {
    const vehicle = this.vehicles.get(vehicleId);
    if (!vehicle) {
      throw new NotFoundException('Vehicle not found.');
    }

    return vehicle;
  }

  private getSortedHistory(vehicleId: string): GpsPosition[] {
    const history = this.positionsByVehicle.get(vehicleId) ?? [];
    return [...history].sort((a, b) =>
      a.timestamp.localeCompare(b.timestamp),
    );
  }

  private getRandomCoordinate(
    previous: number | undefined,
    min: number,
    max: number,
  ): number {
    if (typeof previous === 'number') {
      const delta = (Math.random() - 0.5) * 0.01;
      return this.clamp(previous + delta, min, max);
    }

    const random = min + Math.random() * (max - min);
    return Number(random.toFixed(6));
  }

  private getRandomSpeed(previous: number | undefined): number {
    if (typeof previous === 'number') {
      const delta = (Math.random() - 0.5) * 15;
      return Number(this.clamp(previous + delta, 0, 160).toFixed(2));
    }

    return Number((20 + Math.random() * 70).toFixed(2));
  }

  private clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
  }
}
