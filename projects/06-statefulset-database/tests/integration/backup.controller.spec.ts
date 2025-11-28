import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { KubernetesStatefulSetService } from '../../src/infrastructure/external/kubernetes-statefulset.service';
import { KubernetesSnapshotService } from '../../src/infrastructure/external/kubernetes-snapshot.service';

describe('BackupController (integration)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(KubernetesStatefulSetService)
      .useValue({
        getStatefulSetStatus: jest.fn().mockResolvedValue({
          readyReplicas: 3,
          replicas: 3,
          currentReplicas: 3,
          updatedReplicas: 3,
        }),
        listPVCs: jest.fn().mockResolvedValue([
          { name: 'postgres-data-0', size: '10Gi', status: 'Bound' },
        ]),
        getPVC: jest.fn().mockResolvedValue({
          name: 'postgres-data-0',
          size: '10Gi',
          status: 'Bound',
        }),
      })
      .overrideProvider(KubernetesSnapshotService)
      .useValue({
        createSnapshot: jest.fn().mockResolvedValue({
          name: 'test-snapshot',
          volumeSnapshotName: 'test-snapshot',
          pvcName: 'postgres-data-0',
          size: 0,
          createdAt: new Date(),
          readyToUse: false,
        }),
        getSnapshotStatus: jest.fn().mockResolvedValue({
          name: 'test-snapshot',
          volumeSnapshotName: 'test-snapshot',
          pvcName: 'postgres-data-0',
          size: 1024,
          createdAt: new Date(),
          readyToUse: true,
        }),
        listSnapshots: jest.fn().mockResolvedValue([]),
        deleteSnapshot: jest.fn().mockResolvedValue(undefined),
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
      expect(response.body.kubernetes).toBe(true);
    });
  });

  describe('POST /backup', () => {
    it('should create a backup', async () => {
      const response = await request(app.getHttpServer())
        .post('/backup')
        .send({
          databaseName: 'postgres',
          namespace: 'default',
          backupType: 'manual',
        })
        .expect(201);

      expect(response.body.id).toBeDefined();
      expect(response.body.databaseName).toBe('postgres');
      expect(response.body.namespace).toBe('default');
    });
  });

  describe('GET /backup/statefulset/:name/status', () => {
    it('should return StatefulSet status', async () => {
      const response = await request(app.getHttpServer())
        .get('/backup/statefulset/postgres/status?namespace=default')
        .expect(200);

      expect(response.body.readyReplicas).toBe(3);
      expect(response.body.replicas).toBe(3);
    });
  });
});

