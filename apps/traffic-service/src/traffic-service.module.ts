import { Module } from '@nestjs/common';
import { PrismaClientModule } from '@app/prisma-client';
import { EventsModule } from '@app/common';
import { TrafficServiceResolver } from './traffic-service.resolver';
import { TrafficServiceService } from './traffic-service.service';

@Module({
  imports: [PrismaClientModule, EventsModule],
  providers: [TrafficServiceService, TrafficServiceResolver],
  exports: [TrafficServiceService],
})
export class TrafficServiceModule {}
