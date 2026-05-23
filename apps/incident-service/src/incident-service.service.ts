import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClientService } from '@app/prisma-client';
import { IncidentStatus } from '@prisma/client';
import { EventsGateway } from '@app/common';
import { CreateIncidentInput } from './dto/create-incident.input';

@Injectable()
export class IncidentServiceService {
  constructor(
    private readonly prisma: PrismaClientService,
    private readonly events: EventsGateway,
  ) {}

  async declareIncident(input: CreateIncidentInput, reportedById: string) {
    const incident = await this.prisma.incident.create({
      data: {
        type: input.type,
        description: input.description.trim(),
        latitude: input.latitude,
        longitude: input.longitude,
        reportedById,
        zoneId: input.zoneId ?? null,
      },
    });
    this.events.emitNewIncident(incident);
    return incident;
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
