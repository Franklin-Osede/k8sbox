import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PDBController } from './presentation/controllers/pdb.controller';
import { HealthController } from './presentation/controllers/health.controller';
import { AvailabilityDomainService } from './domain/domain-services/availability.service';
import { CreatePDBUseCase } from './application/use-cases/create-pdb.use-case';
import { GetPDBStatusUseCase } from './application/use-cases/get-pdb-status.use-case';
import { ListPDBsUseCase } from './application/use-cases/list-pdbs.use-case';
import { GetAvailabilitySummaryUseCase } from './application/use-cases/get-availability-summary.use-case';
import { AppLoggerService } from './infrastructure/external/logger.service';
import { KubernetesPDBService } from './infrastructure/external/kubernetes-pdb.service';

@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [PDBController, HealthController],
  providers: [
    // Infrastructure Services
    AppLoggerService,
    KubernetesPDBService,
    // Domain Services
    AvailabilityDomainService,
    // Use Cases
    CreatePDBUseCase,
    GetPDBStatusUseCase,
    ListPDBsUseCase,
    GetAvailabilitySummaryUseCase,
  ],
})
export class AppModule {}

