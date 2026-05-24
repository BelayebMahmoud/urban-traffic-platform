import { Test, TestingModule } from '@nestjs/testing';
import { IncidentStatus } from '@prisma/client';
import { JwtAuthGuard } from '@app/common/guards/jwt-auth.guard';
import { IncidentServiceController } from './incident-service.controller';
import { IncidentServiceService } from './incident-service.service';

const incidentServiceMock = {
  declareIncident: jest.fn(),
  getIncidents: jest.fn(),
  getIncident: jest.fn(),
  updateIncidentStatus: jest.fn(),
};

const mockReq = { user: { id: 'user-1' } };

describe('IncidentServiceController', () => {
  let controller: IncidentServiceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IncidentServiceController],
      providers: [
        { provide: IncidentServiceService, useValue: incidentServiceMock },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<IncidentServiceController>(
      IncidentServiceController,
    );
    jest.clearAllMocks();
  });

  it('delegates declareIncident — passes body and req.user.id to service', () => {
    const body = {
      type: 'ACCIDENT' as any,
      description: 'Crash',
      latitude: 36.8,
      longitude: 10.1,
    };
    controller.declareIncident(body, mockReq);
    expect(incidentServiceMock.declareIncident).toHaveBeenCalledWith(
      body,
      'user-1',
    );
  });

  it('delegates getIncidents to the service', () => {
    controller.getIncidents();
    expect(incidentServiceMock.getIncidents).toHaveBeenCalled();
  });

  it('delegates getIncident with the correct id', () => {
    controller.getIncident('i1');
    expect(incidentServiceMock.getIncident).toHaveBeenCalledWith('i1');
  });

  it('delegates updateIncidentStatus with id and status', () => {
    controller.updateIncidentStatus('i1', IncidentStatus.IN_PROGRESS);
    expect(incidentServiceMock.updateIncidentStatus).toHaveBeenCalledWith(
      'i1',
      IncidentStatus.IN_PROGRESS,
    );
  });
});
