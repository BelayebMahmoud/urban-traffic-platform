import { Test, TestingModule } from '@nestjs/testing';
import { NotificationServiceController } from './notification-service.controller';

describe('NotificationServiceController', () => {
  let controller: NotificationServiceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationServiceController],
    }).compile();

    controller = module.get<NotificationServiceController>(NotificationServiceController);
  });

  it('is defined', () => {
    expect(controller).toBeDefined();
  });
});
