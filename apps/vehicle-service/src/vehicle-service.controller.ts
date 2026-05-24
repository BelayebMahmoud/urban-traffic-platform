import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '@app/common/guards/jwt-auth.guard';
import { SimulatePositionDto } from './dto/simulate-position.dto';
import { VehicleServiceService } from './vehicle-service.service';

interface CreateVehicleBody {
  plateNumber: string;
  type: any;
  status: any;
  latitude: number;
  longitude: number;
}

@Controller('vehicles')
export class VehicleServiceController {
  constructor(private readonly vehicleServiceService: VehicleServiceService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  createVehicle(@Body() body: CreateVehicleBody, @Request() req: any) {
    return this.vehicleServiceService.createVehicle({
      ...body,
      ownerId: req.user.id,
    });
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
