import { UseGuards } from '@nestjs/common';
import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CurrentUser } from '@app/common/decorators/current-user.decorator';
import { Roles } from '@app/common/decorators/roles.decorator';
import { JwtAuthGuard } from '@app/common/guards/jwt-auth.guard';
import { RolesGuard } from '@app/common/guards/roles.guard';
import { SendNotificationInput } from './dto/send-notification.input';
import { NotificationGql } from './models/notification.model';
import { NotificationServiceService } from './notification-service.service';

@Resolver(() => NotificationGql)
export class NotificationServiceResolver {
  constructor(private readonly notifications: NotificationServiceService) {}

  @Query(() => [NotificationGql])
  @UseGuards(JwtAuthGuard)
  myNotifications(@CurrentUser() user: { id: string }): Promise<any[]> {
    return this.notifications.getNotifications(user.id);
  }

  @Mutation(() => NotificationGql)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  sendNotification(@Args('input') input: SendNotificationInput): Promise<any> {
    return this.notifications.sendNotification(input);
  }

  @Mutation(() => NotificationGql)
  @UseGuards(JwtAuthGuard)
  markNotificationAsRead(@Args('id', { type: () => ID }) id: string): Promise<any> {
    return this.notifications.markAsRead(id);
  }
}
