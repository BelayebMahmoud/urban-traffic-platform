import { Module } from '@nestjs/common';
import { TrafficServiceController } from './traffic-service.controller';
import { TrafficServiceService } from './traffic-service.service';

@Module({
  imports: [],
  controllers: [TrafficServiceController],
  providers: [TrafficServiceService],
})
export class TrafficServiceModule {}
