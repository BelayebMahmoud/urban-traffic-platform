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

  describe('incidents', () => {
    it('should declare and list incidents', () => {
      const incident = incidentServiceController.declareIncident({
        type: 'ACCIDENT',
        description: 'Collision on the main road',
        latitude: 36.8065,
        longitude: 10.1815,
        reportedBy: 'operator-1',
      });

      expect(incident.status).toBe('REPORTED');
      expect(incidentServiceController.getIncidents()).toContainEqual(incident);
    });

    it('should update incident status', () => {
      const incident = incidentServiceController.declareIncident({
        type: 'TRAFFIC_JAM',
        description: 'Heavy traffic near city center',
        latitude: 36.8,
        longitude: 10.18,
        reportedBy: 'operator-1',
      });

      expect(
        incidentServiceController.updateIncidentStatus(incident.id, {
          status: 'IN_PROGRESS',
        }).status,
      ).toBe('IN_PROGRESS');
    });
  });
});
