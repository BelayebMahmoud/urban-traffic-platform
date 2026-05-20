import { Test, TestingModule } from '@nestjs/testing';
import { IncidentServiceController } from './incident-service.controller';
import { IncidentServiceService } from './incident-service.service';

describe('IncidentServiceController', () => {
  let incidentServiceController: IncidentServiceController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [IncidentServiceController],
      providers: [IncidentServiceService],
    }).compile();

    incidentServiceController = app.get<IncidentServiceController>(IncidentServiceController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(incidentServiceController.getHello()).toBe('Hello World!');
    });
  });
});
