import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';

describe('ConfigController (integration)', () => {
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

  describe('GET /config', () => {
    it('should return current configuration', () => {
      return request(app.getHttpServer())
        .get('/config')
        .expect(200)
        .expect((res) => {
          expect(res.body.config).toBeDefined();
          expect(res.body.lastReload).toBeDefined();
          expect(res.body.reloadCount).toBeDefined();
          expect(res.body.configSize).toBeDefined();
        });
    });
  });

  describe('POST /config/reload', () => {
    it('should reload configuration', () => {
      return request(app.getHttpServer())
        .post('/config/reload')
        .expect(200)
        .expect((res) => {
          expect(res.body.config).toBeDefined();
          expect(res.body.reloadCount).toBeGreaterThanOrEqual(0);
        });
    });
  });
});

