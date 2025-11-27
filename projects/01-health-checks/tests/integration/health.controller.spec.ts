import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';

describe('HealthController (integration)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /health/live', () => {
    it('should return 200 with healthy status', () => {
      return request(app.getHttpServer())
        .get('/health/live')
        .expect(200)
        .expect((res) => {
          expect(res.body.status).toBe('healthy');
          expect(res.body.message).toBeDefined();
          expect(res.body.timestamp).toBeDefined();
        });
    });
  });

  describe('GET /health/ready', () => {
    it('should return 200 when ready', () => {
      return request(app.getHttpServer())
        .get('/health/ready')
        .expect(200)
        .expect((res) => {
          expect(res.body.status).toBeDefined();
          expect(res.body.message).toBeDefined();
        });
    });
  });

  describe('GET /health/startup', () => {
    it('should return 200 when started', () => {
      return request(app.getHttpServer())
        .get('/health/startup')
        .expect(200)
        .expect((res) => {
          expect(res.body.status).toBeDefined();
          expect(res.body.message).toBeDefined();
        });
    });
  });
});

