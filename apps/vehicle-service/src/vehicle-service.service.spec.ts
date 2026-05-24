/**
 * Unit tests for VehicleServiceService
 * Coverage target: >80%
 * Mock strategy: PrismaClientService injected via useValue
 */
import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { VehicleServiceService } from './vehicle-service.service';
import { PrismaClientService } from '@app/prisma-client';

const prismaMock = {
  vehicle: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
  },
  gpsPosition: {
    findFirst: jest.fn(),
    create: jest.fn(),
    findMany: jest.fn(),
  },
};

describe('VehicleServiceService', () => {
  let service: VehicleServiceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VehicleServiceService,
        { provide: PrismaClientService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<VehicleServiceService>(VehicleServiceService);
    jest.clearAllMocks();
  });

  describe('getVehicles()', () => {
    it('returns array of vehicles', async () => {
      // ARRANGE
      const fakeVehicles = [{ id: 'v1', plateNumber: 'AB-123' }, { id: 'v2', plateNumber: 'CD-456' }];
      prismaMock.vehicle.findMany.mockResolvedValue(fakeVehicles);

      // ACT
      const result = await service.getVehicles();

      // ASSERT
      expect(result).toEqual(fakeVehicles);
      expect(prismaMock.vehicle.findMany).toHaveBeenCalledWith({ orderBy: { createdAt: 'desc' } });
    });

    it('returns empty array when no vehicles exist', async () => {
      // ARRANGE
      prismaMock.vehicle.findMany.mockResolvedValue([]);

      // ACT
      const result = await service.getVehicles();

      // ASSERT
      expect(result).toEqual([]);
    });
  });

  describe('getVehicle(id)', () => {
    it('returns vehicle with its positions when found', async () => {
      // ARRANGE
      const fakeVehicle = { id: 'v1', plateNumber: 'AB-123', positions: [] };
      prismaMock.vehicle.findUnique.mockResolvedValue(fakeVehicle);

      // ACT
      const result = await service.getVehicle('v1');

      // ASSERT
      expect(result).toEqual(fakeVehicle);
      expect(prismaMock.vehicle.findUnique).toHaveBeenCalledWith({
        where: { id: 'v1' },
        include: { positions: { orderBy: { timestamp: 'asc' } } },
      });
    });

    it('throws NotFoundException when vehicle does not exist', async () => {
      // ARRANGE
      prismaMock.vehicle.findUnique.mockResolvedValue(null);

      // ACT + ASSERT
      await expect(service.getVehicle('nonexistent-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('createVehicle(data)', () => {
    const createData = {
      plateNumber: ' ab-123-cd ',
      type: 'CAR' as any,
      status: 'ACTIVE' as any,
      ownerId: 'user-1',
    };

    it('creates vehicle and returns it', async () => {
      // ARRANGE
      const fakeVehicle = { id: 'v1', plateNumber: 'AB-123-CD', type: 'CAR', status: 'ACTIVE', ownerId: 'user-1' };
      prismaMock.vehicle.findUnique.mockResolvedValue(null);
      prismaMock.vehicle.create.mockResolvedValue(fakeVehicle);

      // ACT
      const result = await service.createVehicle(createData);

      // ASSERT
      expect(result).toEqual(fakeVehicle);
    });

    it('normalizes plate number to uppercase and trims whitespace', async () => {
      // ARRANGE
      prismaMock.vehicle.findUnique.mockResolvedValue(null);
      prismaMock.vehicle.create.mockResolvedValue({ id: 'v1', plateNumber: 'AB-123-CD' });

      // ACT
      await service.createVehicle(createData);

      // ASSERT
      expect(prismaMock.vehicle.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ plateNumber: 'AB-123-CD' }),
      });
    });

    it('calls prisma.vehicle.findUnique to check for duplicate plate before creating', async () => {
      // ARRANGE
      prismaMock.vehicle.findUnique.mockResolvedValue(null);
      prismaMock.vehicle.create.mockResolvedValue({ id: 'v1' });

      // ACT
      await service.createVehicle(createData);

      // ASSERT
      expect(prismaMock.vehicle.findUnique).toHaveBeenCalledWith({ where: { plateNumber: 'AB-123-CD' } });
    });

    it('throws BadRequestException when plate number already exists', async () => {
      // ARRANGE
      prismaMock.vehicle.findUnique.mockResolvedValue({ id: 'existing-v', plateNumber: 'AB-123-CD' });

      // ACT + ASSERT
      await expect(service.createVehicle(createData)).rejects.toThrow(BadRequestException);
      expect(prismaMock.vehicle.create).not.toHaveBeenCalled();
    });
  });

  describe('recordGpsPosition(vehicleId, data)', () => {
    it('creates GPS position with provided coordinates and returns it', async () => {
      // ARRANGE
      const fakeVehicle = { id: 'v1', plateNumber: 'AB-123', positions: [] };
      const fakePosition = { id: 'p1', vehicleId: 'v1', latitude: 48.8566, longitude: 2.3522, speed: 60 };
      prismaMock.vehicle.findUnique.mockResolvedValue(fakeVehicle);
      prismaMock.gpsPosition.findFirst.mockResolvedValue(null);
      prismaMock.gpsPosition.create.mockResolvedValue(fakePosition);

      // ACT
      const result = await service.recordGpsPosition('v1', { latitude: 48.8566, longitude: 2.3522, speed: 60 });

      // ASSERT
      expect(result).toEqual(fakePosition);
      expect(prismaMock.gpsPosition.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ vehicleId: 'v1', latitude: 48.8566, longitude: 2.3522, speed: 60 }),
      });
    });

    it('nudges coordinates from last known position when none are provided', async () => {
      // ARRANGE
      const fakeVehicle = { id: 'v1', positions: [] };
      const lastPosition = { vehicleId: 'v1', latitude: 36.8, longitude: 10.1, speed: 50 };
      prismaMock.vehicle.findUnique.mockResolvedValue(fakeVehicle);
      prismaMock.gpsPosition.findFirst.mockResolvedValue(lastPosition);
      prismaMock.gpsPosition.create.mockResolvedValue({ id: 'p2', vehicleId: 'v1', latitude: 36.801, longitude: 10.101, speed: 55 });

      // ACT
      await service.recordGpsPosition('v1', {});

      // ASSERT
      const callArg = prismaMock.gpsPosition.create.mock.calls[0][0].data;
      expect(callArg.vehicleId).toBe('v1');
      expect(callArg.latitude).toBeGreaterThanOrEqual(-90);
      expect(callArg.latitude).toBeLessThanOrEqual(90);
      expect(callArg.longitude).toBeGreaterThanOrEqual(-180);
      expect(callArg.longitude).toBeLessThanOrEqual(180);
    });

    it('generates random coordinates within valid range when no prior position exists', async () => {
      // ARRANGE
      const fakeVehicle = { id: 'v1', positions: [] };
      prismaMock.vehicle.findUnique.mockResolvedValue(fakeVehicle);
      prismaMock.gpsPosition.findFirst.mockResolvedValue(null);
      prismaMock.gpsPosition.create.mockResolvedValue({ id: 'p1', vehicleId: 'v1', latitude: 36.8, longitude: 10.1, speed: 45 });

      // ACT
      await service.recordGpsPosition('v1', {});

      // ASSERT
      const callArg = prismaMock.gpsPosition.create.mock.calls[0][0].data;
      expect(callArg.latitude).toBeGreaterThanOrEqual(-90);
      expect(callArg.latitude).toBeLessThanOrEqual(90);
      expect(callArg.longitude).toBeGreaterThanOrEqual(-180);
      expect(callArg.longitude).toBeLessThanOrEqual(180);
      expect(callArg.speed).toBeGreaterThanOrEqual(0);
      expect(callArg.speed).toBeLessThanOrEqual(160);
    });

    it('throws NotFoundException when vehicle does not exist', async () => {
      // ARRANGE
      prismaMock.vehicle.findUnique.mockResolvedValue(null);

      // ACT + ASSERT
      await expect(service.recordGpsPosition('nonexistent', { latitude: 1, longitude: 1 })).rejects.toThrow(NotFoundException);
      expect(prismaMock.gpsPosition.create).not.toHaveBeenCalled();
    });
  });

  describe('getMovementHistory(vehicleId)', () => {
    it('returns positions ordered by timestamp ascending', async () => {
      // ARRANGE
      const fakeVehicle = { id: 'v1', positions: [] };
      const fakeHistory = [
        { id: 'p1', vehicleId: 'v1', timestamp: new Date('2024-01-01') },
        { id: 'p2', vehicleId: 'v1', timestamp: new Date('2024-01-02') },
      ];
      prismaMock.vehicle.findUnique.mockResolvedValue(fakeVehicle);
      prismaMock.gpsPosition.findMany.mockResolvedValue(fakeHistory);

      // ACT
      const result = await service.getMovementHistory('v1');

      // ASSERT
      expect(result).toEqual(fakeHistory);
      expect(prismaMock.gpsPosition.findMany).toHaveBeenCalledWith({
        where: { vehicleId: 'v1' },
        orderBy: { timestamp: 'asc' },
      });
    });

    it('returns empty array when vehicle has no recorded positions', async () => {
      // ARRANGE
      prismaMock.vehicle.findUnique.mockResolvedValue({ id: 'v1', positions: [] });
      prismaMock.gpsPosition.findMany.mockResolvedValue([]);

      // ACT
      const result = await service.getMovementHistory('v1');

      // ASSERT
      expect(result).toEqual([]);
    });

    it('throws NotFoundException when vehicle does not exist', async () => {
      // ARRANGE
      prismaMock.vehicle.findUnique.mockResolvedValue(null);

      // ACT + ASSERT
      await expect(service.getMovementHistory('nonexistent')).rejects.toThrow(NotFoundException);
      expect(prismaMock.gpsPosition.findMany).not.toHaveBeenCalled();
    });
  });
});
