import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { MetricsController } from './presentation/controllers/metrics.controller';
import { HealthController } from './presentation/controllers/health.controller';
import { ScalingDomainService } from './domain/domain-services/scaling.service';
import { GetMetricsUseCase } from './application/use-cases/get-metrics.use-case';
import { GetScalingDecisionUseCase } from './application/use-cases/get-scaling-decision.use-case';
import { AppLoggerService } from './infrastructure/external/logger.service';
import { PrometheusMetricsService } from './infrastructure/external/prometheus-metrics.service';
import { MetricsInterceptor } from './presentation/interceptors/metrics.interceptor';

@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [MetricsController, HealthController],
  providers: [
    // Infrastructure Services
    AppLoggerService,
    PrometheusMetricsService,
    // Domain Services
    ScalingDomainService,
    // Use Cases
    GetMetricsUseCase,
    GetScalingDecisionUseCase,
    // Interceptors
    {
      provide: APP_INTERCEPTOR,
      useClass: MetricsInterceptor,
    },
  ],
})
export class AppModule {}


