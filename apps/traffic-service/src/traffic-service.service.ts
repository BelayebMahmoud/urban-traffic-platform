import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClientService } from '@app/prisma-client';
import { TrafficLevel } from '@prisma/client';
import { CreateZoneInput } from './dto/create-zone.input';
import { UpdateDensityInput } from './dto/update-density.input';

@Injectable()
export class TrafficServiceService {
  constructor(private readonly prisma: PrismaClientService) {}

  createZone(input: CreateZoneInput) {
    return this.prisma.trafficZone.create({ data: input });
  }

  getZones() {
    return this.prisma.trafficZone.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async getZone(id: string) {
    const zone = await this.prisma.trafficZone.findUnique({ where: { id } });
    if (!zone) throw new NotFoundException('Traffic zone not found.');
    return zone;
  }

  async updateDensity(input: UpdateDensityInput) {
    await this.getZone(input.zoneId);
    const level = this.classifyDensity(input.density);
    return this.prisma.trafficZone.update({
      where: { id: input.zoneId },
      data: { density: input.density, level },
    });
  }

  getCongestedZones() {
    return this.prisma.trafficZone.findMany({
      where: { level: TrafficLevel.HIGH },
      orderBy: { density: 'desc' },
    });
  }

  private classifyDensity(density: number): TrafficLevel {
    if (density >= 70) return TrafficLevel.HIGH;
    if (density >= 30) return TrafficLevel.MEDIUM;
    return TrafficLevel.LOW;
  }
}
