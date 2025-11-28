import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ResourceController } from './presentation/controllers/resource.controller';
import { OperatorController } from './presentation/controllers/operator.controller';
import { HealthController } from './presentation/controllers/health.controller';
import { ReconciliationDomainService } from './domain/domain-services/reconciliation.service';
import { ReconcileResourceUseCase } from './application/use-cases/reconcile-resource.use-case';
import { ListResourcesUseCase } from './application/use-cases/list-resources.use-case';
import { GetResourceUseCase } from './application/use-cases/get-resource.use-case';
import { AppLoggerService } from './infrastructure/external/logger.service';
import { KubernetesCRDService } from './infrastructure/external/kubernetes-crd.service';

@Module({
  imports: [ConfigModule.forRoot(), ScheduleModule.forRoot()],
  controllers: [ResourceController, OperatorController, HealthController],
  providers: [
    // Infrastructure Services
    AppLoggerService,
    KubernetesCRDService,
    // Domain Services
    ReconciliationDomainService,
    // Use Cases
    ReconcileResourceUseCase,
    ListResourcesUseCase,
    GetResourceUseCase,
  ],
})
export class AppModule {}

