import { Test, TestingModule } from '@nestjs/testing';
import { VehicleServiceController } from './vehicle-service.controller';
import { VehicleServiceService } from './vehicle-service.service';

describe('VehicleServiceController', () => {
  let vehicleServiceController: VehicleServiceController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [VehicleServiceController],
      providers: [VehicleServiceService],
    }).compile();

    vehicleServiceController = app.get<VehicleServiceController>(VehicleServiceController);
  });

  describe('vehicle workflow', () => {
    it('should add a vehicle, simulate a position and expose history', () => {
      const vehicle = vehicleServiceController.addVehicle({
        plateNumber: 'ab-123-cd',
        type: 'CAR',
        status: 'ACTIVE',
        ownerName: 'Alice',
      });

      const vehicles = vehicleServiceController.getVehicles();
      expect(vehicles).toHaveLength(1);
      expect(vehicles[0].plateNumber).toBe('AB-123-CD');

      const position = vehicleServiceController.saveSimulatedPosition(vehicle.id, {
        latitude: 48.8566,
        longitude: 2.3522,
        speed: 50,
      });

      expect(position.vehicleId).toBe(vehicle.id);
      expect(position.simulated).toBe(true);

      const details = vehicleServiceController.getVehicleDetails(vehicle.id);
      expect(details.totalPositions).toBe(1);
      expect(details.latestPosition?.id).toBe(position.id);

      const history = vehicleServiceController.getMovementHistory(vehicle.id);
      expect(history).toHaveLength(1);
      expect(history[0].id).toBe(position.id);
    });
  });
});
