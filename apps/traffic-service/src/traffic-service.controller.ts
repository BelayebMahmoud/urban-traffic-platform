import { Controller, Get } from '@nestjs/common';
import { TrafficServiceService } from './traffic-service.service';

@Controller()
export class TrafficServiceController {
  constructor(private readonly trafficServiceService: TrafficServiceService) {}

  @Get()
  getHello(): string {
    return this.trafficServiceService.getHello();
  }
}
