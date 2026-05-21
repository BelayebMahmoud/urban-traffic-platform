import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { CreateIncidentDto } from './dto/create-incident.dto';
import { UpdateIncidentStatusDto } from './dto/update-incident-status.dto';
import { Incident } from './models/incident.model';

@Injectable()
export class IncidentServiceService {
  private readonly incidents = new Map<string, Incident>();

  declareIncident(dto: CreateIncidentDto): Incident {
    const now = new Date().toISOString();
    const incident: Incident = {
      id: randomUUID(),
      type: dto.type,
      status: 'REPORTED',
      description: dto.description.trim(),
      latitude: dto.latitude,
      longitude: dto.longitude,
      reportedBy: dto.reportedBy.trim(),
      createdAt: now,
      updatedAt: now,
    };

    this.incidents.set(incident.id, incident);

    return incident;
  }

  getIncidents(): Incident[] {
    return [...this.incidents.values()].sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt),
    );
  }

  getIncidentDetails(incidentId: string): Incident {
    return this.getIncidentOrThrow(incidentId);
  }

  updateIncidentStatus(
    incidentId: string,
    dto: UpdateIncidentStatusDto,
  ): Incident {
    const incident = this.getIncidentOrThrow(incidentId);
    const updatedIncident: Incident = {
      ...incident,
      status: dto.status,
      updatedAt: new Date().toISOString(),
    };

    this.incidents.set(incidentId, updatedIncident);

    return updatedIncident;
  }

  private getIncidentOrThrow(incidentId: string): Incident {
    const incident = this.incidents.get(incidentId);
    if (!incident) {
      throw new NotFoundException('Incident not found.');
    }

    return incident;
  }
}
