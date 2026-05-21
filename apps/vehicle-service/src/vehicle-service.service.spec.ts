import { BadRequestException, NotFoundException } from '@nestjs/common';
import { VehicleServiceService } from './vehicle-service.service';

describe('VehicleServiceService', () => {
  let service: VehicleServiceService;

  beforeEach(() => {
    service = new VehicleServiceService();
  });

  it('should add a vehicle and normalize values', () => {
    const vehicle = service.addVehicle({
      plateNumber: ' ab-123-cd ',
      type: 'CAR',
      status: 'ACTIVE',
      ownerName: '  Alice  ',
    });

    expect(vehicle.plateNumber).toBe('AB-123-CD');
    expect(vehicle.ownerName).toBe('Alice');

    const vehicles = service.getVehicles();
    expect(vehicles).toHaveLength(1);
    expect(vehicles[0].id).toBe(vehicle.id);
  });

  it('should reject duplicate plate numbers', () => {
    service.addVehicle({
      plateNumber: 'ab-123-cd',
      type: 'CAR',
      status: 'ACTIVE',
      ownerName: 'Alice',
    });

    expect(() =>
      service.addVehicle({
        plateNumber: 'AB-123-CD',
        type: 'BUS',
        status: 'INACTIVE',
        ownerName: 'Bob',
      }),
    ).toThrow(BadRequestException);
  });

  it('should return vehicle details with empty history initially', () => {
    const vehicle = service.addVehicle({
      plateNumber: 'xy-999-zt',
      type: 'BUS',
      status: 'ACTIVE',
      ownerName: 'City Transit',
    });

    const details = service.getVehicleDetails(vehicle.id);

    expect(details.id).toBe(vehicle.id);
    expect(details.totalPositions).toBe(0);
    expect(details.latestPosition).toBeNull();
  });

  it('should throw when vehicle details are requested for an unknown id', () => {
    expect(() => service.getVehicleDetails('unknown-id')).toThrow(NotFoundException);
  });

  it('should save a provided simulated position and expose it in history', () => {
    const vehicle = service.addVehicle({
      plateNumber: 'mh-001-aa',
      type: 'EMERGENCY',
      status: 'ACTIVE',
      ownerName: 'Medical Team',
    });

    const position = service.saveSimulatedPosition(vehicle.id, {
      latitude: 48.8566,
      longitude: 2.3522,
      speed: 60,
    });

    expect(position.vehicleId).toBe(vehicle.id);
    expect(position.latitude).toBe(48.8566);
    expect(position.longitude).toBe(2.3522);
    expect(position.speed).toBe(60);
    expect(position.simulated).toBe(true);

    const details = service.getVehicleDetails(vehicle.id);
    expect(details.totalPositions).toBe(1);
    expect(details.latestPosition?.id).toBe(position.id);

    const history = service.getMovementHistory(vehicle.id);
    expect(history).toHaveLength(1);
    expect(history[0].id).toBe(position.id);
  });

  it('should generate valid random values when simulated position payload is empty', () => {
    const vehicle = service.addVehicle({
      plateNumber: 'tt-777-vv',
      type: 'TRUCK',
      status: 'ACTIVE',
      ownerName: 'Logistics',
    });

    const generated = service.saveSimulatedPosition(vehicle.id, {});

    expect(generated.latitude).toBeGreaterThanOrEqual(-90);
    expect(generated.latitude).toBeLessThanOrEqual(90);
    expect(generated.longitude).toBeGreaterThanOrEqual(-180);
    expect(generated.longitude).toBeLessThanOrEqual(180);
    expect(generated.speed).toBeDefined();
    expect(generated.speed as number).toBeGreaterThanOrEqual(0);
    expect(generated.speed as number).toBeLessThanOrEqual(160);
  });

  it('should throw when saving a position for an unknown vehicle', () => {
    expect(() => service.saveSimulatedPosition('unknown-id', {})).toThrow(
      NotFoundException,
    );
  });

  it('should throw when movement history is requested for an unknown vehicle', () => {
    expect(() => service.getMovementHistory('unknown-id')).toThrow(NotFoundException);
  });
});
