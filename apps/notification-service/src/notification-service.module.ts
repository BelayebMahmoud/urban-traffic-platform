import { Module } from '@nestjs/common';
import { PrismaClientModule } from '@app/prisma-client';
import { EventsModule } from '@app/common';
import { NotificationServiceResolver } from './notification-service.resolver';
import { NotificationServiceService } from './notification-service.service';

@Module({
  imports: [PrismaClientModule, EventsModule],
  providers: [NotificationServiceService, NotificationServiceResolver],
  exports: [NotificationServiceService],
})
export class NotificationServiceModule {}
