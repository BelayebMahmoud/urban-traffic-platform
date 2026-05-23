import { Module } from '@nestjs/common';
import { PrismaClientModule } from '@app/prisma-client';
import { TrafficServiceController } from './traffic-service.controller';
import { TrafficServiceResolver } from './traffic-service.resolver';
import { TrafficServiceService } from './traffic-service.service';

@Module({
  imports: [PrismaClientModule],
  controllers: [TrafficServiceController],
  providers: [TrafficServiceService, TrafficServiceResolver],
  exports: [TrafficServiceService],
})
export class TrafficServiceModule {}
