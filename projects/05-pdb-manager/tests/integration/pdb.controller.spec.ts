import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { KubernetesPDBService } from '../../src/infrastructure/external/kubernetes-pdb.service';

describe('PDBController (integration)', () => {
  let app: INestApplication;
  let kubernetesService: KubernetesPDBService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(KubernetesPDBService)
      .useValue({
        listPDBs: jest.fn().mockResolvedValue([]),
        getPDBStatus: jest.fn().mockResolvedValue(null),
        createOrUpdatePDB: jest.fn().mockResolvedValue(undefined),
        deletePDB: jest.fn().mockResolvedValue(undefined),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());

    kubernetesService = moduleFixture.get<KubernetesPDBService>(KubernetesPDBService);

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
      expect(response.body.kubernetes).toBe(true);
    });
  });

  describe('GET /pdb', () => {
    it('should list PDBs', async () => {
      const response = await request(app.getHttpServer())
        .get('/pdb?namespace=default')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('GET /pdb/summary/availability', () => {
    it('should return availability summary', async () => {
      const response = await request(app.getHttpServer())
        .get('/pdb/summary/availability?namespace=default')
        .expect(200);

      expect(response.body).toHaveProperty('totalPDBs');
      expect(response.body).toHaveProperty('healthyPDBs');
      expect(response.body).toHaveProperty('violatedPDBs');
      expect(response.body).toHaveProperty('averageAvailability');
      expect(response.body.totalPDBs).toBe(0);
      expect(response.body.averageAvailability).toBe(0);
    });
  });
});

