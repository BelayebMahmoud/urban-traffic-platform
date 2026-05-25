/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/**
 * Unit tests for IncidentServiceService
 * Coverage target: >80%
 * Mock strategy: PrismaClientService injected via useValue; EventsGateway injected via useValue
 */
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { IncidentStatus, IncidentType } from '@prisma/client';
import { IncidentServiceService } from './incident-service.service';
import { PrismaClientService } from '@app/prisma-client';
import { EventsGateway } from '@app/common';

const prismaMock = {
  incident: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
};

const eventsGatewayMock = {
  emitNewIncident: jest.fn(),
};

describe('IncidentServiceService', () => {
  let service: IncidentServiceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IncidentServiceService,
        { provide: PrismaClientService, useValue: prismaMock },
        { provide: EventsGateway, useValue: eventsGatewayMock },
      ],
    }).compile();

    service = module.get<IncidentServiceService>(IncidentServiceService);
    jest.clearAllMocks();
  });

  describe('declareIncident()', () => {
    const baseInput = {
      type: IncidentType.ACCIDENT,
      description: '  Collision on main road  ',
      latitude: 36.8065,
      longitude: 10.1815,
    };

    it('creates incident and returns it', async () => {
      // ARRANGE
      const fakeIncident = {
        id: 'i1',
        ...baseInput,
        status: IncidentStatus.REPORTED,
        reportedById: 'user-1',
      };
      prismaMock.incident.create.mockResolvedValue(fakeIncident);

      // ACT
      const result = await service.declareIncident(baseInput as any, 'user-1');

      // ASSERT
      expect(result).toEqual(fakeIncident);
    });

    it('trims whitespace from description before saving', async () => {
      // ARRANGE
      prismaMock.incident.create.mockResolvedValue({ id: 'i1' });

      // ACT
      await service.declareIncident(baseInput as any, 'user-1');

      // ASSERT
      expect(prismaMock.incident.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          description: 'Collision on main road',
        }),
      });
    });

    it('saves with the correct reportedById', async () => {
      // ARRANGE
      prismaMock.incident.create.mockResolvedValue({ id: 'i1' });

      // ACT
      await service.declareIncident(baseInput as any, 'operator-42');

      // ASSERT
      expect(prismaMock.incident.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ reportedById: 'operator-42' }),
      });
    });

    it('passes zoneId as null when not provided', async () => {
      // ARRANGE
      prismaMock.incident.create.mockResolvedValue({ id: 'i1' });

      // ACT
      await service.declareIncident({ ...baseInput } as any, 'user-1');

      // ASSERT
      expect(prismaMock.incident.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ zoneId: null }),
      });
    });

    it('passes zoneId when provided', async () => {
      // ARRANGE
      const inputWithZone = { ...baseInput, zoneId: 'zone-abc' };
      prismaMock.incident.create.mockResolvedValue({ id: 'i1' });

      // ACT
      await service.declareIncident(inputWithZone as any, 'user-1');

      // ASSERT
      expect(prismaMock.incident.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ zoneId: 'zone-abc' }),
      });
    });

    it('emits incident:new WebSocket event after creating', async () => {
      // ARRANGE
      const fakeIncident = { id: 'i1', type: IncidentType.ACCIDENT };
      prismaMock.incident.create.mockResolvedValue(fakeIncident);

      // ACT
      await service.declareIncident(baseInput as any, 'user-1');

      // ASSERT
      expect(eventsGatewayMock.emitNewIncident).toHaveBeenCalledWith(
        fakeIncident,
      );
    });

    it('handles all incident types (CONSTRUCTION, ROAD_CLOSED, TRAFFIC_JAM)', async () => {
      // ARRANGE
      for (const type of [
        IncidentType.CONSTRUCTION,
        IncidentType.ROAD_CLOSED,
        IncidentType.TRAFFIC_JAM,
      ]) {
        prismaMock.incident.create.mockResolvedValue({ id: 'i1', type });

        // ACT
        await service.declareIncident({ ...baseInput, type } as any, 'user-1');

        // ASSERT
        expect(prismaMock.incident.create).toHaveBeenCalledWith({
          data: expect.objectContaining({ type }),
        });
        jest.clearAllMocks();
      }
    });
  });

  describe('getIncidents()', () => {
    it('returns all incidents ordered by creation date descending', async () => {
      // ARRANGE
      const fakeIncidents = [{ id: 'i1' }, { id: 'i2' }];
      prismaMock.incident.findMany.mockResolvedValue(fakeIncidents);

      // ACT
      const result = await service.getIncidents();

      // ASSERT
      expect(result).toEqual(fakeIncidents);
      expect(prismaMock.incident.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: 'desc' },
      });
    });

    it('returns empty array when no incidents exist', async () => {
      // ARRANGE
      prismaMock.incident.findMany.mockResolvedValue([]);

      // ACT
      const result = await service.getIncidents();

      // ASSERT
      expect(result).toEqual([]);
    });
  });

  describe('getIncident(id)', () => {
    it('returns incident when found', async () => {
      // ARRANGE
      const fakeIncident = {
        id: 'i1',
        type: IncidentType.TRAFFIC_JAM,
        status: IncidentStatus.REPORTED,
      };
      prismaMock.incident.findUnique.mockResolvedValue(fakeIncident);

      // ACT
      const result = await service.getIncident('i1');

      // ASSERT
      expect(result).toEqual(fakeIncident);
      expect(prismaMock.incident.findUnique).toHaveBeenCalledWith({
        where: { id: 'i1' },
      });
    });

    it('throws NotFoundException when incident does not exist', async () => {
      // ARRANGE
      prismaMock.incident.findUnique.mockResolvedValue(null);

      // ACT + ASSERT
      await expect(service.getIncident('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateIncidentStatus()', () => {
    it('updates to IN_PROGRESS and returns updated incident', async () => {
      // ARRANGE
      const existing = { id: 'i1', status: IncidentStatus.REPORTED };
      const updated = { ...existing, status: IncidentStatus.IN_PROGRESS };
      prismaMock.incident.findUnique.mockResolvedValue(existing);
      prismaMock.incident.update.mockResolvedValue(updated);

      // ACT
      const result = await service.updateIncidentStatus(
        'i1',
        IncidentStatus.IN_PROGRESS,
      );

      // ASSERT
      expect(result).toEqual(updated);
      expect(prismaMock.incident.update).toHaveBeenCalledWith({
        where: { id: 'i1' },
        data: { status: IncidentStatus.IN_PROGRESS },
      });
    });

    it('updates to RESOLVED and returns updated incident', async () => {
      // ARRANGE
      const existing = { id: 'i1', status: IncidentStatus.IN_PROGRESS };
      const updated = { ...existing, status: IncidentStatus.RESOLVED };
      prismaMock.incident.findUnique.mockResolvedValue(existing);
      prismaMock.incident.update.mockResolvedValue(updated);

      // ACT
      const result = await service.updateIncidentStatus(
        'i1',
        IncidentStatus.RESOLVED,
      );

      // ASSERT
      expect(result).toEqual(updated);
    });

    it('verifies incident exists before updating', async () => {
      // ARRANGE
      const existing = { id: 'i1', status: IncidentStatus.REPORTED };
      prismaMock.incident.findUnique.mockResolvedValue(existing);
      prismaMock.incident.update.mockResolvedValue({
        ...existing,
        status: IncidentStatus.IN_PROGRESS,
      });

      // ACT
      await service.updateIncidentStatus('i1', IncidentStatus.IN_PROGRESS);

      // ASSERT
      expect(prismaMock.incident.findUnique).toHaveBeenCalledWith({
        where: { id: 'i1' },
      });
    });

    it('throws NotFoundException when incident does not exist', async () => {
      // ARRANGE
      prismaMock.incident.findUnique.mockResolvedValue(null);

      // ACT + ASSERT
      await expect(
        service.updateIncidentStatus('nonexistent', IncidentStatus.RESOLVED),
      ).rejects.toThrow(NotFoundException);
      expect(prismaMock.incident.update).not.toHaveBeenCalled();
    });
  });
});
