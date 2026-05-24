import { Module } from '@nestjs/common';
import { PrismaClientModule } from '@app/prisma-client';
import { VehicleServiceResolver } from './vehicle-service.resolver';
import { VehicleServiceService } from './vehicle-service.service';

@Module({
  imports: [PrismaClientModule],
  providers: [VehicleServiceService, VehicleServiceResolver],
  exports: [VehicleServiceService],
})
export class VehicleServiceModule {}
