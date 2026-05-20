import { Controller, Get } from '@nestjs/common';
import { IncidentServiceService } from './incident-service.service';

@Controller()
export class IncidentServiceController {
  constructor(private readonly incidentServiceService: IncidentServiceService) {}

  @Get()
  getHello(): string {
    return this.incidentServiceService.getHello();
  }
}
