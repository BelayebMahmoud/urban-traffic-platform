import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClientService } from '@app/prisma-client';
import { IncidentStatus } from '@prisma/client';
import { CreateIncidentInput } from './dto/create-incident.input';

@Injectable()
export class IncidentServiceService {
  constructor(private readonly prisma: PrismaClientService) {}

  declareIncident(input: CreateIncidentInput, reportedById: string) {
    return this.prisma.incident.create({
      data: {
        type: input.type,
        description: input.description.trim(),
        latitude: input.latitude,
        longitude: input.longitude,
        reportedById,
        zoneId: input.zoneId ?? null,
      },
    });
  }

  getIncidents() {
    return this.prisma.incident.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async getIncident(id: string) {
    const incident = await this.prisma.incident.findUnique({ where: { id } });
    if (!incident) throw new NotFoundException('Incident not found.');
    return incident;
  }

  async updateIncidentStatus(incidentId: string, status: IncidentStatus) {
    await this.getIncident(incidentId);
    return this.prisma.incident.update({
      where: { id: incidentId },
      data: { status },
    });
  }
}
