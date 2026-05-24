import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClientService } from '@app/prisma-client';
import { EventsGateway } from '@app/common';
import { SendNotificationInput } from './dto/send-notification.input';

@Injectable()
export class NotificationServiceService {
  constructor(
    private readonly prisma: PrismaClientService,
    private readonly events: EventsGateway,
  ) {}

  async sendNotification(input: SendNotificationInput) {
    const notif = await this.prisma.notification.create({ data: input });
    this.events.emitUserNotification(input.userId, notif);
    return notif;
  }

  getNotifications(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async markAsRead(id: string) {
    const notif = await this.prisma.notification.findUnique({ where: { id } });
    if (!notif) throw new NotFoundException('Notification not found.');
    return this.prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
  }
}
