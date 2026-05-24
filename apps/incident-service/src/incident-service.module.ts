import { Module } from '@nestjs/common';
import { PrismaClientModule } from '@app/prisma-client';
import { IncidentServiceResolver } from './incident-service.resolver';
import { IncidentServiceService } from './incident-service.service';

@Module({
  imports: [PrismaClientModule],
  providers: [IncidentServiceService, IncidentServiceResolver],
  exports: [IncidentServiceService],
})
export class IncidentServiceModule {}
