import { Module } from '@nestjs/common';
import { IncidentServiceController } from './incident-service.controller';
import { IncidentServiceService } from './incident-service.service';

@Module({
  imports: [],
  controllers: [IncidentServiceController],
  providers: [IncidentServiceService],
})
export class IncidentServiceModule {}
