import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaClientService } from '@app/prisma-client';
import { VehicleStatus, VehicleType } from '@prisma/client';
import { EventsGateway } from '@app/common';

interface CreateVehicleData {
  plateNumber: string;
  type: VehicleType;
  status: VehicleStatus;
  ownerId: string;
  latitude: number;
  longitude: number;
}

interface SimulateData {
  latitude: number;
  longitude: number;
  speed?: number;
}

@Injectable()
export class VehicleServiceService {
  constructor(
    private readonly prisma: PrismaClientService,
    private readonly events: EventsGateway,
  ) {}

  async createVehicle(data: CreateVehicleData) {
    const plate = data.plateNumber.trim().toUpperCase();
    const existing = await this.prisma.vehicle.findUnique({
      where: { plateNumber: plate },
    });
    if (existing)
      throw new BadRequestException(
        'A vehicle with this plate number already exists.',
      );

    const vehicle = await this.prisma.vehicle.create({
      data: {
        plateNumber: plate,
        type: data.type,
        status: data.status,
        ownerId: data.ownerId,
      },
    });

    await this.prisma.gpsPosition.create({
      data: {
        vehicleId: vehicle.id,
        latitude: data.latitude,
        longitude: data.longitude,
        speed: null,
      },
    });
    this.events.emitVehiclePosition({
      vehicleId: vehicle.id,
      latitude: data.latitude,
      longitude: data.longitude,
      speed: null,
    });

    return vehicle;
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

    const speed = data.speed ?? this.nudgeSpeed(last?.speed ?? undefined);

    const position = await this.prisma.gpsPosition.create({
      data: {
        vehicleId,
        latitude: data.latitude,
        longitude: data.longitude,
        speed,
      },
    });
    this.events.emitVehiclePosition({
      vehicleId,
      latitude: position.latitude,
      longitude: position.longitude,
      speed: position.speed,
    });
    return position;
  }

  async getMovementHistory(vehicleId: string) {
    await this.getVehicle(vehicleId);
    return this.prisma.gpsPosition.findMany({
      where: { vehicleId },
      orderBy: { timestamp: 'asc' },
    });
  }

  private nudgeSpeed(prev: number | undefined): number {
    if (prev != null)
      return Number(
        this.clamp(prev + (Math.random() - 0.5) * 15, 0, 160).toFixed(2),
      );
    return Number((20 + Math.random() * 70).toFixed(2));
  }

  private clamp(v: number, min: number, max: number) {
    return Math.min(Math.max(v, min), max);
  }
}
