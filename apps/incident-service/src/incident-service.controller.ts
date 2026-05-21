import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { CreateIncidentDto } from './dto/create-incident.dto';
import { UpdateIncidentStatusDto } from './dto/update-incident-status.dto';
import { IncidentServiceService } from './incident-service.service';

@Controller('incidents')
export class IncidentServiceController {
  constructor(private readonly incidentServiceService: IncidentServiceService) {}

  @Post()
  declareIncident(@Body() dto: CreateIncidentDto) {
    return this.incidentServiceService.declareIncident(dto);
  }

  @Get()
  getIncidents() {
    return this.incidentServiceService.getIncidents();
  }

  @Get(':incidentId')
  getIncidentDetails(@Param('incidentId') incidentId: string) {
    return this.incidentServiceService.getIncidentDetails(incidentId);
  }

  @Patch(':incidentId/status')
  updateIncidentStatus(
    @Param('incidentId') incidentId: string,
    @Body() dto: UpdateIncidentStatusDto,
  ) {
    return this.incidentServiceService.updateIncidentStatus(incidentId, dto);
  }
}
