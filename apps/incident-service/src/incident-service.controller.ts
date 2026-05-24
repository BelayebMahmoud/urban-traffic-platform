import { Body, Controller, Get, Param, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@app/common/guards/jwt-auth.guard';
import { IncidentStatus } from '@prisma/client';
import { IncidentServiceService } from './incident-service.service';

interface CreateIncidentBody {
  type: any;
  description: string;
  latitude: number;
  longitude: number;
  zoneId?: string;
}

@Controller('incidents')
export class IncidentServiceController {
  constructor(private readonly incidentServiceService: IncidentServiceService) { }

  @Post()
  @UseGuards(JwtAuthGuard)
  declareIncident(@Body() body: CreateIncidentBody, @Request() req: any) {
    return this.incidentServiceService.declareIncident(body as any, req.user.id);
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
