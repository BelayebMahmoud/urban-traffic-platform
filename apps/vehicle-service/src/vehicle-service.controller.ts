import { Controller, Get } from '@nestjs/common';
import { VehicleServiceService } from './vehicle-service.service';

@Controller()
export class VehicleServiceController {
  constructor(private readonly vehicleServiceService: VehicleServiceService) {}

  @Get()
  getHello(): string {
    return this.vehicleServiceService.getHello();
  }
}
