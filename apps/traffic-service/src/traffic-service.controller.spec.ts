import { Test, TestingModule } from '@nestjs/testing';
import { JwtAuthGuard } from '@app/common/guards/jwt-auth.guard';
import { RolesGuard } from '@app/common/guards/roles.guard';
import { TrafficServiceController } from './traffic-service.controller';
import { TrafficServiceService } from './traffic-service.service';

const trafficServiceMock = {
  createZone: jest.fn(),
  getZones: jest.fn(),
  getCongestedZones: jest.fn(),
  getZone: jest.fn(),
  updateDensity: jest.fn(),
};

describe('TrafficServiceController', () => {
  let controller: TrafficServiceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TrafficServiceController],
      providers: [
        { provide: TrafficServiceService, useValue: trafficServiceMock },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<TrafficServiceController>(TrafficServiceController);
    jest.clearAllMocks();
  });

  it('delegates createZone to the service', () => {
    const body = {
      name: 'Zone A',
      latitude: 36.8,
      longitude: 10.1,
      radius: 500,
    };
    controller.createZone(body);
    expect(trafficServiceMock.createZone).toHaveBeenCalledWith(body);
  });

  it('delegates getZones to the service', () => {
    controller.getZones();
    expect(trafficServiceMock.getZones).toHaveBeenCalled();
  });

  it('delegates getCongestedZones to the service', () => {
    controller.getCongestedZones();
    expect(trafficServiceMock.getCongestedZones).toHaveBeenCalled();
  });

  it('delegates getZone with the correct id', () => {
    controller.getZone('z1');
    expect(trafficServiceMock.getZone).toHaveBeenCalledWith('z1');
  });

  it('delegates updateDensity with zoneId and density', () => {
    const body = { zoneId: 'z1', density: 80 };
    controller.updateDensity(body);
    expect(trafficServiceMock.updateDensity).toHaveBeenCalledWith(body);
  });
});
