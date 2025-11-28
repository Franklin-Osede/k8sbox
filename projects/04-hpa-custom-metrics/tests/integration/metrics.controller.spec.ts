import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrometheusMetricsService } from '../../src/infrastructure/external/prometheus-metrics.service';

describe('MetricsController (integration)', () => {
  let app: INestApplication;
  let metricsService: PrometheusMetricsService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());

    metricsService = moduleFixture.get<PrometheusMetricsService>(PrometheusMetricsService);

    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('GET /metrics/prometheus', () => {
    it('should return Prometheus metrics', async () => {
      const response = await request(app.getHttpServer())
        .get('/metrics/prometheus')
        .expect(200);

      expect(response.text).toContain('requests_per_second');
      expect(response.text).toContain('queue_depth');
      expect(response.text).toContain('active_connections');
    });
  });

  describe('GET /metrics/summary', () => {
    it('should return metrics summary', async () => {
      const response = await request(app.getHttpServer())
        .get('/metrics/summary')
        .expect(200);

      expect(response.body).toHaveProperty('requestsPerSecond');
      expect(response.body).toHaveProperty('queueDepth');
      expect(response.body).toHaveProperty('activeConnections');
    });
  });

  describe('GET /metrics/scaling-decision', () => {
    it('should return scaling decision', async () => {
      const response = await request(app.getHttpServer())
        .get('/metrics/scaling-decision?currentReplicas=2&metricType=rps')
        .expect(200);

      expect(response.body).toHaveProperty('action');
      expect(response.body).toHaveProperty('currentReplicas');
      expect(response.body).toHaveProperty('targetReplicas');
      expect(response.body).toHaveProperty('shouldScale');
    });
  });

  describe('POST /metrics/simulate-load', () => {
    it('should simulate load', async () => {
      const response = await request(app.getHttpServer())
        .post('/metrics/simulate-load')
        .send({ rps: 150, queueDepth: 50, connections: 100 })
        .expect(200);

      expect(response.body.message).toBe('Load simulated successfully');

      // Verify metrics were updated
      const summary = await request(app.getHttpServer())
        .get('/metrics/summary')
        .expect(200);

      expect(summary.body.requestsPerSecond).toBe(150);
      expect(summary.body.queueDepth).toBe(50);
      expect(summary.body.activeConnections).toBe(100);
    });
  });
});


