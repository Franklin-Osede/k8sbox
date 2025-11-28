import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { ArgoCDApplicationService } from '../../src/infrastructure/external/argocd-application.service';

describe('DeploymentController (integration)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(ArgoCDApplicationService)
      .useValue({
        createApplication: jest.fn().mockResolvedValue(undefined),
        getApplication: jest.fn().mockResolvedValue(null),
        listApplications: jest.fn().mockResolvedValue([]),
        syncApplication: jest.fn().mockResolvedValue(undefined),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());

    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('GET /health/live', () => {
    it('should return liveness status', async () => {
      const response = await request(app.getHttpServer())
        .get('/health/live')
        .expect(200);

      expect(response.body.status).toBe('healthy');
    });
  });

  describe('POST /deployments', () => {
    it('should create a deployment', async () => {
      const response = await request(app.getHttpServer())
        .post('/deployments')
        .send({
          name: 'my-app',
          environment: 'dev',
          gitRepo: 'https://github.com/user/repo',
          gitPath: 'apps/my-app',
          namespace: 'default',
        })
        .expect(201);

      expect(response.body.name).toBe('my-app');
      expect(response.body.environment).toBe('dev');
    });
  });
});

