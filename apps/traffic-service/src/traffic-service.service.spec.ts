/**
 * Unit tests for TrafficServiceService
 * Coverage target: >80%
 * Mock strategy: PrismaClientService injected via useValue; EventsGateway injected via useValue
 */
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { TrafficLevel } from '@prisma/client';
import { TrafficServiceService } from './traffic-service.service';
import { PrismaClientService } from '@app/prisma-client';
import { EventsGateway } from '@app/common';

const prismaMock = {
  trafficZone: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
};

const eventsGatewayMock = {
  emitZoneUpdated: jest.fn(),
};

describe('TrafficServiceService', () => {
  let service: TrafficServiceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TrafficServiceService,
        { provide: PrismaClientService, useValue: prismaMock },
        { provide: EventsGateway, useValue: eventsGatewayMock },
      ],
    }).compile();

    service = module.get<TrafficServiceService>(TrafficServiceService);
    jest.clearAllMocks();
  });

  describe('classifyDensity() — private pure function', () => {
    it('returns LOW when density is 0', () => {
      expect((service as any).classifyDensity(0)).toBe(TrafficLevel.LOW);
    });

    it('returns LOW when density is 29 (just below MEDIUM threshold)', () => {
      expect((service as any).classifyDensity(29)).toBe(TrafficLevel.LOW);
    });

    it('returns MEDIUM at exactly 30 (boundary)', () => {
      expect((service as any).classifyDensity(30)).toBe(TrafficLevel.MEDIUM);
    });

    it('returns MEDIUM when density is 50', () => {
      expect((service as any).classifyDensity(50)).toBe(TrafficLevel.MEDIUM);
    });

    it('returns MEDIUM when density is 69 (just below HIGH threshold)', () => {
      expect((service as any).classifyDensity(69)).toBe(TrafficLevel.MEDIUM);
    });

    it('returns HIGH at exactly 70 (boundary)', () => {
      expect((service as any).classifyDensity(70)).toBe(TrafficLevel.HIGH);
    });

    it('returns HIGH when density is above 100', () => {
      expect((service as any).classifyDensity(110)).toBe(TrafficLevel.HIGH);
    });
  });

  describe('createZone()', () => {
    it('creates and returns the traffic zone', async () => {
      // ARRANGE
      const input = { name: 'Zone A', latitude: 36.8, longitude: 10.1, radius: 500 };
      const fakeZone = { id: 'z1', ...input, density: 0, level: TrafficLevel.LOW };
      prismaMock.trafficZone.create.mockResolvedValue(fakeZone);

      // ACT
      const result = await service.createZone(input as any);

      // ASSERT
      expect(result).toEqual(fakeZone);
      expect(prismaMock.trafficZone.create).toHaveBeenCalledWith({ data: input });
    });
  });

  describe('getZones()', () => {
    it('returns all zones ordered by creation date descending', async () => {
      // ARRANGE
      const fakeZones = [{ id: 'z1' }, { id: 'z2' }];
      prismaMock.trafficZone.findMany.mockResolvedValue(fakeZones);

      // ACT
      const result = await service.getZones();

      // ASSERT
      expect(result).toEqual(fakeZones);
      expect(prismaMock.trafficZone.findMany).toHaveBeenCalledWith({ orderBy: { createdAt: 'desc' } });
    });

    it('returns empty array when no zones exist', async () => {
      // ARRANGE
      prismaMock.trafficZone.findMany.mockResolvedValue([]);

      // ACT
      const result = await service.getZones();

      // ASSERT
      expect(result).toEqual([]);
    });
  });

  describe('getZone(id)', () => {
    it('returns zone when found', async () => {
      // ARRANGE
      const fakeZone = { id: 'z1', name: 'Zone A', level: TrafficLevel.LOW };
      prismaMock.trafficZone.findUnique.mockResolvedValue(fakeZone);

      // ACT
      const result = await service.getZone('z1');

      // ASSERT
      expect(result).toEqual(fakeZone);
      expect(prismaMock.trafficZone.findUnique).toHaveBeenCalledWith({ where: { id: 'z1' } });
    });

    it('throws NotFoundException when zone does not exist', async () => {
      // ARRANGE
      prismaMock.trafficZone.findUnique.mockResolvedValue(null);

      // ACT + ASSERT
      await expect(service.getZone('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateDensity()', () => {
    it('classifies density ≥70 as HIGH and persists it', async () => {
      // ARRANGE
      const existingZone = { id: 'z1', name: 'Zone A', density: 0, level: TrafficLevel.LOW };
      const updatedZone = { ...existingZone, density: 80, level: TrafficLevel.HIGH };
      prismaMock.trafficZone.findUnique.mockResolvedValue(existingZone);
      prismaMock.trafficZone.update.mockResolvedValue(updatedZone);

      // ACT
      const result = await service.updateDensity({ zoneId: 'z1', density: 80 });

      // ASSERT
      expect(result).toEqual(updatedZone);
      expect(prismaMock.trafficZone.update).toHaveBeenCalledWith({
        where: { id: 'z1' },
        data: { density: 80, level: TrafficLevel.HIGH },
      });
    });

    it('classifies density between 30 and 69 as MEDIUM', async () => {
      // ARRANGE
      const existingZone = { id: 'z1', density: 0, level: TrafficLevel.LOW };
      const updatedZone = { ...existingZone, density: 50, level: TrafficLevel.MEDIUM };
      prismaMock.trafficZone.findUnique.mockResolvedValue(existingZone);
      prismaMock.trafficZone.update.mockResolvedValue(updatedZone);

      // ACT
      await service.updateDensity({ zoneId: 'z1', density: 50 });

      // ASSERT
      expect(prismaMock.trafficZone.update).toHaveBeenCalledWith({
        where: { id: 'z1' },
        data: { density: 50, level: TrafficLevel.MEDIUM },
      });
    });

    it('classifies density below 30 as LOW', async () => {
      // ARRANGE
      const existingZone = { id: 'z1', density: 80, level: TrafficLevel.HIGH };
      const updatedZone = { ...existingZone, density: 10, level: TrafficLevel.LOW };
      prismaMock.trafficZone.findUnique.mockResolvedValue(existingZone);
      prismaMock.trafficZone.update.mockResolvedValue(updatedZone);

      // ACT
      await service.updateDensity({ zoneId: 'z1', density: 10 });

      // ASSERT
      expect(prismaMock.trafficZone.update).toHaveBeenCalledWith({
        where: { id: 'z1' },
        data: { density: 10, level: TrafficLevel.LOW },
      });
    });

    it('emits zone:updated WebSocket event after saving', async () => {
      // ARRANGE
      const existingZone = { id: 'z1', density: 0, level: TrafficLevel.LOW };
      const updatedZone = { ...existingZone, density: 80, level: TrafficLevel.HIGH };
      prismaMock.trafficZone.findUnique.mockResolvedValue(existingZone);
      prismaMock.trafficZone.update.mockResolvedValue(updatedZone);

      // ACT
      await service.updateDensity({ zoneId: 'z1', density: 80 });

      // ASSERT
      expect(eventsGatewayMock.emitZoneUpdated).toHaveBeenCalledWith(updatedZone);
    });

    it('throws NotFoundException when zone does not exist', async () => {
      // ARRANGE
      prismaMock.trafficZone.findUnique.mockResolvedValue(null);

      // ACT + ASSERT
      await expect(service.updateDensity({ zoneId: 'nonexistent', density: 80 })).rejects.toThrow(NotFoundException);
      expect(prismaMock.trafficZone.update).not.toHaveBeenCalled();
      expect(eventsGatewayMock.emitZoneUpdated).not.toHaveBeenCalled();
    });
  });

  describe('getCongestedZones()', () => {
    it('queries only zones with HIGH traffic level ordered by density descending', async () => {
      // ARRANGE
      const highZones = [
        { id: 'z1', level: TrafficLevel.HIGH, density: 90 },
        { id: 'z2', level: TrafficLevel.HIGH, density: 75 },
      ];
      prismaMock.trafficZone.findMany.mockResolvedValue(highZones);

      // ACT
      const result = await service.getCongestedZones();

      // ASSERT
      expect(result).toEqual(highZones);
      expect(prismaMock.trafficZone.findMany).toHaveBeenCalledWith({
        where: { level: TrafficLevel.HIGH },
        orderBy: { density: 'desc' },
      });
    });

    it('returns empty array when no congested zones exist', async () => {
      // ARRANGE
      prismaMock.trafficZone.findMany.mockResolvedValue([]);

      // ACT
      const result = await service.getCongestedZones();

      // ASSERT
      expect(result).toEqual([]);
    });
  });
});
