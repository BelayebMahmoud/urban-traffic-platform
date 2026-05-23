import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { IncidentStatus } from '@prisma/client';
import { IncidentServiceService } from './incident-service.service';

interface CreateIncidentBody {
  type: any;
  description: string;
  latitude: number;
  longitude: number;
  reportedById: string;
  zoneId?: string;
}

@Controller('incidents')
export class IncidentServiceController {
  constructor(private readonly incidentServiceService: IncidentServiceService) {}

  @Post()
  declareIncident(@Body() body: CreateIncidentBody) {
    const { reportedById, ...rest } = body;
    return this.incidentServiceService.declareIncident(rest as any, reportedById);
  }

  @Get()
  getIncidents() {
    return this.incidentServiceService.getIncidents();
  }

  @Get(':incidentId')
  getIncident(@Param('incidentId') incidentId: string) {
    return this.incidentServiceService.getIncident(incidentId);
  }

  @Patch(':incidentId/status')
  updateIncidentStatus(
    @Param('incidentId') incidentId: string,
    @Body('status') status: IncidentStatus,
  ) {
    return this.incidentServiceService.updateIncidentStatus(incidentId, status);
  }
}
