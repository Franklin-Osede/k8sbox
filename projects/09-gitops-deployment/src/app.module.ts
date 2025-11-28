import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DeploymentController } from './presentation/controllers/deployment.controller';
import { HealthController } from './presentation/controllers/health.controller';
import { GitOpsDomainService } from './domain/domain-services/gitops.service';
import { CreateDeploymentUseCase } from './application/use-cases/create-deployment.use-case';
import { SyncDeploymentUseCase } from './application/use-cases/sync-deployment.use-case';
import { GetDeploymentStatusUseCase } from './application/use-cases/get-deployment-status.use-case';
import { ListDeploymentsUseCase } from './application/use-cases/list-deployments.use-case';
import { AppLoggerService } from './infrastructure/external/logger.service';
import { ArgoCDApplicationService } from './infrastructure/external/argocd-application.service';

@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [DeploymentController, HealthController],
  providers: [
    // Infrastructure Services
    AppLoggerService,
    ArgoCDApplicationService,
    // Domain Services
    GitOpsDomainService,
    // Use Cases
    CreateDeploymentUseCase,
    SyncDeploymentUseCase,
    GetDeploymentStatusUseCase,
    ListDeploymentsUseCase,
  ],
})
export class AppModule {}

