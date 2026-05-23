import { Module } from '@nestjs/common';
import { PrismaClientModule } from '@app/prisma-client';
import { NotificationServiceController } from './notification-service.controller';
import { NotificationServiceResolver } from './notification-service.resolver';
import { NotificationServiceService } from './notification-service.service';

@Module({
  imports: [PrismaClientModule],
  controllers: [NotificationServiceController],
  providers: [NotificationServiceService, NotificationServiceResolver],
  exports: [NotificationServiceService],
})
export class NotificationServiceModule {}
