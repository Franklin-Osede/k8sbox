import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { IstioVirtualServiceService } from '../../src/infrastructure/external/istio-virtualservice.service';
import { IstioDestinationRuleService } from '../../src/infrastructure/external/istio-destinationrule.service';

describe('TrafficController (integration)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(IstioVirtualServiceService)
      .useValue({
        createOrUpdateVirtualService: jest.fn().mockResolvedValue(undefined),
        getVirtualService: jest.fn().mockResolvedValue({
          metadata: { name: 'test-service', namespace: 'default' },
          spec: {
            http: [
              {
                route: [
                  { destination: { subset: 'v1' }, weight: 90 },
                  { destination: { subset: 'v2' }, weight: 10 },
                ],
              },
            ],
          },
        }),
        deleteVirtualService: jest.fn().mockResolvedValue(undefined),
      })
      .overrideProvider(IstioDestinationRuleService)
      .useValue({
        createOrUpdateDestinationRule: jest.fn().mockResolvedValue(undefined),
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
      expect(response.body.timestamp).toBeDefined();
    });
  });

  describe('POST /traffic', () => {
    it('should create traffic routing configuration', async () => {
      const response = await request(app.getHttpServer())
        .post('/traffic')
        .send({
          serviceName: 'test-service',
          namespace: 'default',
          trafficSplit: {
            v1Weight: 90,
            v2Weight: 10,
          },
          mTLSEnabled: true,
        })
        .expect(201);

      expect(response.body.serviceName).toBe('test-service');
      expect(response.body.trafficSplit.v1Weight).toBe(90);
      expect(response.body.trafficSplit.v2Weight).toBe(10);
      expect(response.body.isCanaryDeployment).toBe(true);
    });
  });

  describe('GET /traffic/:serviceName', () => {
    it('should get traffic routing configuration', async () => {
      const response = await request(app.getHttpServer())
        .get('/traffic/test-service?namespace=default')
        .expect(200);

      expect(response.body.serviceName).toBe('test-service');
      expect(response.body.trafficSplit).toBeDefined();
    });
  });
});

