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

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(vehicleServiceController.getHello()).toBe('Hello World!');
    });
  });
});
