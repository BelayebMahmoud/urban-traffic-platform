/* eslint-disable @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { IncidentServiceModule } from './../src/incident-service.module';

describe('IncidentServiceController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [IncidentServiceModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();
  });

  it('/incidents (POST, GET, PATCH)', async () => {
    const createResponse = await request(app.getHttpServer())
      .post('/incidents')
      .send({
        type: 'ACCIDENT',
        description: 'Collision on the main road',
        latitude: 36.8065,
        longitude: 10.1815,
        reportedBy: 'operator-1',
      })
      .expect(201);

    expect(createResponse.body.status).toBe('REPORTED');

    await request(app.getHttpServer())
      .get('/incidents')
      .expect(200)
      .expect(({ body }) => {
        expect(body).toHaveLength(1);
      });

    await request(app.getHttpServer())
      .patch(`/incidents/${createResponse.body.id}/status`)
      .send({ status: 'RESOLVED' })
      .expect(200)
      .expect(({ body }) => {
        expect(body.status).toBe('RESOLVED');
      });
  });
});
