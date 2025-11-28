import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PolicyController } from './presentation/controllers/policy.controller';
import { HealthController } from './presentation/controllers/health.controller';
import { PolicyDomainService } from './domain/domain-services/policy.service';
import { CreatePolicyUseCase } from './application/use-cases/create-policy.use-case';
import { ListPoliciesUseCase } from './application/use-cases/list-policies.use-case';
import { AppLoggerService } from './infrastructure/external/logger.service';
import { KubernetesNetworkPolicyService } from './infrastructure/external/kubernetes-networkpolicy.service';

@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [PolicyController, HealthController],
  providers: [
    // Infrastructure Services
    AppLoggerService,
    KubernetesNetworkPolicyService,
    // Domain Services
    PolicyDomainService,
    // Use Cases
    CreatePolicyUseCase,
    ListPoliciesUseCase,
  ],
})
export class AppModule {}

