import { Module } from '@nestjs/common';
import { VehicleServiceController } from './vehicle-service.controller';
import { VehicleServiceService } from './vehicle-service.service';

@Module({
  imports: [],
  controllers: [VehicleServiceController],
  providers: [VehicleServiceService],
})
export class VehicleServiceModule {}
