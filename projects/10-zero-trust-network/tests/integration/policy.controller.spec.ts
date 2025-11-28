import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { KubernetesNetworkPolicyService } from '../../src/infrastructure/external/kubernetes-networkpolicy.service';

describe('PolicyController (integration)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(KubernetesNetworkPolicyService)
      .useValue({
        createNetworkPolicy: jest.fn().mockResolvedValue(undefined),
        getNetworkPolicy: jest.fn().mockResolvedValue(null),
        listNetworkPolicies: jest.fn().mockResolvedValue([]),
        deleteNetworkPolicy: jest.fn().mockResolvedValue(undefined),
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

  describe('POST /policies', () => {
    it('should create a network policy', async () => {
      const response = await request(app.getHttpServer())
        .post('/policies')
        .send({
          name: 'test-policy',
          namespace: 'default',
          podSelector: { app: 'backend' },
          rules: [
            {
              direction: 'Ingress',
              action: 'Allow',
              from: [{ podSelector: { app: 'frontend' } }],
              ports: [{ protocol: 'TCP', port: 80 }],
            },
          ],
        })
        .expect(201);

      expect(response.body.name).toBe('test-policy');
      expect(response.body.rules.length).toBe(1);
    });
  });
});

