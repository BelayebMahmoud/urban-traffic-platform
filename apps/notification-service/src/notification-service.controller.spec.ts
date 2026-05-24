import { Test, TestingModule } from '@nestjs/testing';
import { JwtAuthGuard } from '@app/common/guards/jwt-auth.guard';
import { RolesGuard } from '@app/common/guards/roles.guard';
import { NotificationServiceController } from './notification-service.controller';
import { NotificationServiceService } from './notification-service.service';

const notificationServiceMock = {
  sendNotification: jest.fn(),
  getNotifications: jest.fn(),
  markAsRead: jest.fn(),
};

describe('NotificationServiceController', () => {
  let controller: NotificationServiceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationServiceController],
      providers: [
        {
          provide: NotificationServiceService,
          useValue: notificationServiceMock,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<NotificationServiceController>(
      NotificationServiceController,
    );
    jest.clearAllMocks();
  });

  it('delegates sendNotification to the service', () => {
    const body = {
      userId: 'u1',
      title: 'Alert',
      message: 'Hi',
      type: 'SYSTEM',
    };
    controller.sendNotification(body);
    expect(notificationServiceMock.sendNotification).toHaveBeenCalled();
  });

  it('delegates getNotifications with the correct userId', () => {
    controller.getNotifications('u1');
    expect(notificationServiceMock.getNotifications).toHaveBeenCalledWith('u1');
  });

  it('delegates markAsRead with the correct id', () => {
    controller.markAsRead('n1');
    expect(notificationServiceMock.markAsRead).toHaveBeenCalledWith('n1');
  });
});
