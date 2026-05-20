import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { SimulatePositionDto } from './dto/simulate-position.dto';
import { VehicleServiceService } from './vehicle-service.service';

@Controller('vehicles')
export class VehicleServiceController {
  constructor(private readonly vehicleServiceService: VehicleServiceService) { }

  @Post()
  addVehicle(@Body() dto: CreateVehicleDto) {
    return this.vehicleServiceService.addVehicle(dto);
  }

  @Get()
  getVehicles() {
    return this.vehicleServiceService.getVehicles();
  }

  @Get(':vehicleId')
  getVehicleDetails(@Param('vehicleId') vehicleId: string) {
    return this.vehicleServiceService.getVehicleDetails(vehicleId);
  }

  @Post(':vehicleId/positions/simulate')
  saveSimulatedPosition(
    @Param('vehicleId') vehicleId: string,
    @Body() dto: SimulatePositionDto,
  ) {
    return this.vehicleServiceService.saveSimulatedPosition(vehicleId, dto);
  }

  @Get(':vehicleId/movements')
  getMovementHistory(@Param('vehicleId') vehicleId: string) {
    return this.vehicleServiceService.getMovementHistory(vehicleId);
  }
}
