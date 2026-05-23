import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { SimulatePositionDto } from './dto/simulate-position.dto';
import { VehicleServiceService } from './vehicle-service.service';

interface CreateVehicleBody {
  plateNumber: string;
  type: any;
  status: any;
  ownerId: string;
}

@Controller('vehicles')
export class VehicleServiceController {
  constructor(private readonly vehicleServiceService: VehicleServiceService) {}

  @Post()
  createVehicle(@Body() body: CreateVehicleBody) {
    return this.vehicleServiceService.createVehicle(body);
  }

  @Get()
  getVehicles() {
    return this.vehicleServiceService.getVehicles();
  }

  @Get(':vehicleId')
  getVehicle(@Param('vehicleId') vehicleId: string) {
    return this.vehicleServiceService.getVehicle(vehicleId);
  }

  @Post(':vehicleId/positions/simulate')
  recordGpsPosition(
    @Param('vehicleId') vehicleId: string,
    @Body() dto: SimulatePositionDto,
  ) {
    return this.vehicleServiceService.recordGpsPosition(vehicleId, dto);
  }

  @Get(':vehicleId/movements')
  getMovementHistory(@Param('vehicleId') vehicleId: string) {
    return this.vehicleServiceService.getMovementHistory(vehicleId);
  }
}
