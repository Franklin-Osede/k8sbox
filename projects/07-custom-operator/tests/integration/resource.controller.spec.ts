import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { KubernetesCRDService } from '../../src/infrastructure/external/kubernetes-crd.service';
import { CustomResourceEntity } from '../../src/domain/entities/custom-resource-entity';
import { ResourceSpecVO } from '../../src/domain/value-objects/resource-spec.vo';

describe('ResourceController (integration)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(KubernetesCRDService)
      .useValue({
        getCustomResource: jest.fn(),
        listCustomResources: jest.fn().mockResolvedValue([]),
        updateStatus: jest.fn().mockResolvedValue(undefined),
        createDeployment: jest.fn().mockResolvedValue(undefined),
        updateDeployment: jest.fn().mockResolvedValue(undefined),
        deploymentExists: jest.fn().mockResolvedValue(false),
        createService: jest.fn().mockResolvedValue(undefined),
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

  describe('GET /health/ready', () => {
    it('should return readiness status', async () => {
      const response = await request(app.getHttpServer())
        .get('/health/ready')
        .expect(200);

      expect(response.body.status).toBe('ready');
    });
  });

  describe('POST /resources', () => {
    it('should create and reconcile a resource', async () => {
      const crdService = app.get(KubernetesCRDService);
      jest.spyOn(crdService, 'deploymentExists').mockResolvedValue(false);
      jest.spyOn(crdService, 'createDeployment').mockResolvedValue(undefined);
      jest.spyOn(crdService, 'createService').mockResolvedValue(undefined);
      jest.spyOn(crdService, 'updateStatus').mockResolvedValue(undefined);

      const response = await request(app.getHttpServer())
        .post('/resources')
        .send({
          name: 'test-app',
          namespace: 'default',
          spec: {
            replicas: 3,
            image: 'nginx:latest',
            port: 80,
          },
        })
        .expect(201);

      expect(response.body.name).toBe('test-app');
      expect(response.body.namespace).toBe('default');
      expect(response.body.spec.replicas).toBe(3);
    });
  });

  describe('GET /resources', () => {
    it('should list resources', async () => {
      const crdService = app.get(KubernetesCRDService);
      const spec = ResourceSpecVO.create(3, 'nginx:latest', 80);
      const resource = CustomResourceEntity.create('test-app', 'default', spec);
      jest.spyOn(crdService, 'listCustomResources').mockResolvedValue([resource]);

      const response = await request(app.getHttpServer())
        .get('/resources')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(1);
    });
  });
});

