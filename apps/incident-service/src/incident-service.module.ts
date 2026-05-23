import { Module } from '@nestjs/common';
import { PrismaClientModule } from '@app/prisma-client';
import { IncidentServiceController } from './incident-service.controller';
import { IncidentServiceResolver } from './incident-service.resolver';
import { IncidentServiceService } from './incident-service.service';

@Module({
  imports: [PrismaClientModule],
  controllers: [IncidentServiceController],
  providers: [IncidentServiceService, IncidentServiceResolver],
  exports: [IncidentServiceService],
})
export class IncidentServiceModule {}
