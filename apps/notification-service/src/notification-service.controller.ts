import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '@app/common/guards/jwt-auth.guard';
import { RolesGuard } from '@app/common/guards/roles.guard';
import { Roles } from '@app/common/decorators/roles.decorator';
import { NotificationServiceService } from './notification-service.service';

@Controller('notifications')
export class NotificationServiceController {
  constructor(private readonly svc: NotificationServiceService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  sendNotification(
    @Body()
    body: {
      userId: string;
      title: string;
      message: string;
      type?: string;
    },
  ) {
    return this.svc.sendNotification({ type: 'GENERAL', ...body });
  }

  @Get(':userId')
  @UseGuards(JwtAuthGuard)
  getNotifications(@Param('userId') userId: string) {
    return this.svc.getNotifications(userId);
  }

  @Patch(':id/read')
  @UseGuards(JwtAuthGuard)
  markAsRead(@Param('id') id: string) {
    return this.svc.markAsRead(id);
  }
}
