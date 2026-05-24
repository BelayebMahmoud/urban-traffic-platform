import { Test, TestingModule } from '@nestjs/testing';
import { JwtAuthGuard } from '@app/common/guards/jwt-auth.guard';
import { VehicleServiceController } from './vehicle-service.controller';
import { VehicleServiceService } from './vehicle-service.service';

const vehicleServiceMock = {
  createVehicle: jest.fn(),
  getVehicles: jest.fn(),
  getVehicle: jest.fn(),
  recordGpsPosition: jest.fn(),
  getMovementHistory: jest.fn(),
};

const mockReq = { user: { id: 'user-1' } };

describe('VehicleServiceController', () => {
  let controller: VehicleServiceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VehicleServiceController],
      providers: [
        { provide: VehicleServiceService, useValue: vehicleServiceMock },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<VehicleServiceController>(VehicleServiceController);
    jest.clearAllMocks();
  });

  it('delegates createVehicle with ownerId taken from req.user', () => {
    const body = {
      plateNumber: 'AB-123',
      type: 'CAR' as any,
      status: 'ACTIVE' as any,
    };
    controller.createVehicle(body, mockReq);
    expect(vehicleServiceMock.createVehicle).toHaveBeenCalledWith({
      ...body,
      ownerId: 'user-1',
    });
  });

  it('delegates getVehicles to the service', () => {
    controller.getVehicles();
    expect(vehicleServiceMock.getVehicles).toHaveBeenCalled();
  });

  it('delegates getVehicle with the correct id', () => {
    controller.getVehicle('v1');
    expect(vehicleServiceMock.getVehicle).toHaveBeenCalledWith('v1');
  });

  it('delegates recordGpsPosition with vehicleId and dto', () => {
    const dto = { latitude: 36.8, longitude: 10.1, speed: 50 };
    controller.recordGpsPosition('v1', dto as any);
    expect(vehicleServiceMock.recordGpsPosition).toHaveBeenCalledWith(
      'v1',
      dto,
    );
  });

  it('delegates getMovementHistory with the correct vehicleId', () => {
    controller.getMovementHistory('v1');
    expect(vehicleServiceMock.getMovementHistory).toHaveBeenCalledWith('v1');
  });
});
