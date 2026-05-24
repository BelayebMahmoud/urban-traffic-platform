/**
 * Unit tests for NotificationServiceService
 * Coverage target: >80%
 * Mock strategy: PrismaClientService injected via useValue; EventsGateway injected via useValue
 */
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { NotificationServiceService } from './notification-service.service';
import { PrismaClientService } from '@app/prisma-client';
import { EventsGateway } from '@app/common';

const prismaMock = {
  notification: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
};

const eventsGatewayMock = {
  emitUserNotification: jest.fn(),
};

describe('NotificationServiceService', () => {
  let service: NotificationServiceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationServiceService,
        { provide: PrismaClientService, useValue: prismaMock },
        { provide: EventsGateway, useValue: eventsGatewayMock },
      ],
    }).compile();

    service = module.get<NotificationServiceService>(NotificationServiceService);
    jest.clearAllMocks();
  });

  describe('sendNotification()', () => {
    const input = {
      userId: 'user-1',
      title: 'Traffic Alert',
      message: 'High congestion near Zone A',
      type: 'INCIDENT',
    };

    it('creates notification with the provided data and returns it', async () => {
      // ARRANGE
      const fakeNotif = { id: 'n1', ...input, isRead: false, createdAt: new Date() };
      prismaMock.notification.create.mockResolvedValue(fakeNotif);

      // ACT
      const result = await service.sendNotification(input as any);

      // ASSERT
      expect(result).toEqual(fakeNotif);
      expect(prismaMock.notification.create).toHaveBeenCalledWith({ data: input });
    });

    it('emits notification:new WebSocket event to the correct user room', async () => {
      // ARRANGE
      const fakeNotif = { id: 'n1', ...input, isRead: false };
      prismaMock.notification.create.mockResolvedValue(fakeNotif);

      // ACT
      await service.sendNotification(input as any);

      // ASSERT
      expect(eventsGatewayMock.emitUserNotification).toHaveBeenCalledWith('user-1', fakeNotif);
    });

    it('emits to userId from the input, not a hardcoded value', async () => {
      // ARRANGE
      const otherInput = { ...input, userId: 'operator-99' };
      const fakeNotif = { id: 'n2', ...otherInput, isRead: false };
      prismaMock.notification.create.mockResolvedValue(fakeNotif);

      // ACT
      await service.sendNotification(otherInput as any);

      // ASSERT
      expect(eventsGatewayMock.emitUserNotification).toHaveBeenCalledWith('operator-99', fakeNotif);
    });
  });

  describe('getNotifications(userId)', () => {
    it('returns notifications for the given user ordered by creation date descending', async () => {
      // ARRANGE
      const fakeNotifs = [
        { id: 'n1', userId: 'user-1', createdAt: new Date('2024-01-02') },
        { id: 'n2', userId: 'user-1', createdAt: new Date('2024-01-01') },
      ];
      prismaMock.notification.findMany.mockResolvedValue(fakeNotifs);

      // ACT
      const result = await service.getNotifications('user-1');

      // ASSERT
      expect(result).toEqual(fakeNotifs);
      expect(prismaMock.notification.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('returns empty array when user has no notifications', async () => {
      // ARRANGE
      prismaMock.notification.findMany.mockResolvedValue([]);

      // ACT
      const result = await service.getNotifications('user-with-no-notifs');

      // ASSERT
      expect(result).toEqual([]);
    });

    it('filters by the given userId, not all notifications', async () => {
      // ARRANGE
      prismaMock.notification.findMany.mockResolvedValue([]);

      // ACT
      await service.getNotifications('specific-user');

      // ASSERT
      expect(prismaMock.notification.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { userId: 'specific-user' } }),
      );
    });
  });

  describe('markAsRead(id)', () => {
    it('sets isRead to true and returns updated notification', async () => {
      // ARRANGE
      const existing = { id: 'n1', isRead: false, userId: 'user-1' };
      const updated = { ...existing, isRead: true };
      prismaMock.notification.findUnique.mockResolvedValue(existing);
      prismaMock.notification.update.mockResolvedValue(updated);

      // ACT
      const result = await service.markAsRead('n1');

      // ASSERT
      expect(result).toEqual(updated);
      expect(prismaMock.notification.update).toHaveBeenCalledWith({
        where: { id: 'n1' },
        data: { isRead: true },
      });
    });

    it('verifies notification exists before updating', async () => {
      // ARRANGE
      const existing = { id: 'n1', isRead: false };
      prismaMock.notification.findUnique.mockResolvedValue(existing);
      prismaMock.notification.update.mockResolvedValue({ ...existing, isRead: true });

      // ACT
      await service.markAsRead('n1');

      // ASSERT
      expect(prismaMock.notification.findUnique).toHaveBeenCalledWith({ where: { id: 'n1' } });
    });

    it('throws NotFoundException when notification does not exist', async () => {
      // ARRANGE
      prismaMock.notification.findUnique.mockResolvedValue(null);

      // ACT + ASSERT
      await expect(service.markAsRead('nonexistent')).rejects.toThrow(NotFoundException);
      expect(prismaMock.notification.update).not.toHaveBeenCalled();
    });

    it('does not emit any WebSocket event when marking as read', async () => {
      // ARRANGE
      const existing = { id: 'n1', isRead: false };
      prismaMock.notification.findUnique.mockResolvedValue(existing);
      prismaMock.notification.update.mockResolvedValue({ ...existing, isRead: true });

      // ACT
      await service.markAsRead('n1');

      // ASSERT
      expect(eventsGatewayMock.emitUserNotification).not.toHaveBeenCalled();
    });
  });
});
