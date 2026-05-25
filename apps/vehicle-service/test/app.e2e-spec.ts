/* eslint-disable @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { VehicleServiceModule } from './../src/vehicle-service.module';

describe('VehicleServiceController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [VehicleServiceModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('should handle vehicle management flow', async () => {
    const createVehicleResponse = await request(app.getHttpServer())
      .post('/vehicles')
      .send({
        plateNumber: 'xy-987-zt',
        type: 'BUS',
        status: 'ACTIVE',
        ownerName: 'City Transit',
      })
      .expect(201);

    const vehicleId = createVehicleResponse.body.id;

    await request(app.getHttpServer())
      .get('/vehicles')
      .expect(200)
      .expect((response) => {
        expect(response.body).toHaveLength(1);
      });

    await request(app.getHttpServer())
      .post(`/vehicles/${vehicleId}/positions/simulate`)
      .send({ latitude: 36.75, longitude: 3.06, speed: 42 })
      .expect(201)
      .expect((response) => {
        expect(response.body.vehicleId).toBe(vehicleId);
        expect(response.body.simulated).toBe(true);
      });

    await request(app.getHttpServer())
      .get(`/vehicles/${vehicleId}`)
      .expect(200)
      .expect((response) => {
        expect(response.body.id).toBe(vehicleId);
        expect(response.body.totalPositions).toBe(1);
      });

    await request(app.getHttpServer())
      .get(`/vehicles/${vehicleId}/movements`)
      .expect(200)
      .expect((response) => {
        expect(response.body).toHaveLength(1);
      });
  });

  afterEach(async () => {
    await app.close();
  });
});
