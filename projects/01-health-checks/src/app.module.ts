import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthController } from './presentation/controllers/health.controller';
import { MetricsController } from './presentation/controllers/metrics.controller';
import { HealthCheckDomainService } from './domain/domain-services/health-check.service';
import { CheckLivenessUseCase } from './application/use-cases/check-liveness.use-case';
import { CheckReadinessUseCase } from './application/use-cases/check-readiness.use-case';
import { CheckStartupUseCase } from './application/use-cases/check-startup.use-case';
import { AppLoggerService } from './infrastructure/external/logger.service';
import { MetricsService } from './infrastructure/external/metrics.service';
import { CircuitBreakerService } from './infrastructure/external/circuit-breaker.service';
import { HealthHistoryService } from './infrastructure/external/health-history.service';

/**
 * AppModule
 * Root module following DDD structure
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
  ],
  controllers: [HealthController, MetricsController],
  providers: [
    // Infrastructure Services
    AppLoggerService,
    MetricsService,
    CircuitBreakerService,
    HealthHistoryService,
    // Domain Services
    HealthCheckDomainService,
    // Use Cases
    CheckLivenessUseCase,
    CheckReadinessUseCase,
    CheckStartupUseCase,
  ],
})
export class AppModule {}

