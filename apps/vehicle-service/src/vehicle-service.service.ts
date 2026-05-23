import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClientService } from '@app/prisma-client';
import { VehicleStatus, VehicleType } from '@prisma/client';

interface CreateVehicleData {
  plateNumber: string;
  type: VehicleType;
  status: VehicleStatus;
  ownerId: string;
}

interface SimulateData {
  latitude?: number;
  longitude?: number;
  speed?: number;
}

@Injectable()
export class VehicleServiceService {
  constructor(private readonly prisma: PrismaClientService) {}

  async createVehicle(data: CreateVehicleData) {
    const plate = data.plateNumber.trim().toUpperCase();
    const existing = await this.prisma.vehicle.findUnique({ where: { plateNumber: plate } });
    if (existing) throw new BadRequestException('A vehicle with this plate number already exists.');

    return this.prisma.vehicle.create({
      data: { plateNumber: plate, type: data.type, status: data.status, ownerId: data.ownerId },
    });
  }

  getVehicles() {
    return this.prisma.vehicle.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async getVehicle(id: string) {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id },
      include: { positions: { orderBy: { timestamp: 'asc' } } },
    });
    if (!vehicle) throw new NotFoundException('Vehicle not found.');
    return vehicle;
  }

  async recordGpsPosition(vehicleId: string, data: SimulateData) {
    await this.getVehicle(vehicleId);

    const last = await this.prisma.gpsPosition.findFirst({
      where: { vehicleId },
      orderBy: { timestamp: 'desc' },
    });

    const latitude = data.latitude ?? this.nudgeCoord(last?.latitude, -90, 90);
    const longitude = data.longitude ?? this.nudgeCoord(last?.longitude, -180, 180);
    const speed = data.speed ?? this.nudgeSpeed(last?.speed ?? undefined);

    return this.prisma.gpsPosition.create({ data: { vehicleId, latitude, longitude, speed } });
  }

  async getMovementHistory(vehicleId: string) {
    await this.getVehicle(vehicleId);
    return this.prisma.gpsPosition.findMany({ where: { vehicleId }, orderBy: { timestamp: 'asc' } });
  }

  private nudgeCoord(prev: number | undefined | null, min: number, max: number): number {
    if (prev != null) return this.clamp(prev + (Math.random() - 0.5) * 0.01, min, max);
    return Number((min + Math.random() * (max - min)).toFixed(6));
  }

  private nudgeSpeed(prev: number | undefined): number {
    if (prev != null) return Number(this.clamp(prev + (Math.random() - 0.5) * 15, 0, 160).toFixed(2));
    return Number((20 + Math.random() * 70).toFixed(2));
  }

  private clamp(v: number, min: number, max: number) {
    return Math.min(Math.max(v, min), max);
  }
}
