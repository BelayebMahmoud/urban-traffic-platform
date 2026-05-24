import { Test, TestingModule } from '@nestjs/testing';
import { TrafficServiceController } from './traffic-service.controller';

describe('TrafficServiceController', () => {
  let controller: TrafficServiceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TrafficServiceController],
    }).compile();

    controller = module.get<TrafficServiceController>(TrafficServiceController);
  });

  it('is defined', () => {
    expect(controller).toBeDefined();
  });
});
