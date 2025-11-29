import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TrafficController } from './presentation/controllers/traffic.controller';
import { HealthController } from './presentation/controllers/health.controller';
import { RoutingDomainService } from './domain/domain-services/routing.service';
import { ApplyRoutingUseCase } from './application/use-cases/apply-routing.use-case';
import { UpdateTrafficSplitUseCase } from './application/use-cases/update-traffic-split.use-case';
import { AppLoggerService } from './infrastructure/external/logger.service';
import { IstioVirtualServiceService } from './infrastructure/external/istio-virtualservice.service';
import { IstioDestinationRuleService } from './infrastructure/external/istio-destinationrule.service';

@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [TrafficController, HealthController],
  providers: [
    // Infrastructure Services
    AppLoggerService,
    IstioVirtualServiceService,
    IstioDestinationRuleService,
    // Domain Services
    RoutingDomainService,
    // Use Cases
    ApplyRoutingUseCase,
    UpdateTrafficSplitUseCase,
  ],
})
export class AppModule {}

