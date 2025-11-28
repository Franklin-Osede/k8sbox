import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RotationController } from './presentation/controllers/rotation.controller';
import { SecretRotationDomainService } from './domain/domain-services/secret-rotation.service';
import { RotateSecretUseCase } from './application/use-cases/rotate-secret.use-case';
import { GetRotationStatusUseCase } from './application/use-cases/get-rotation-status.use-case';
import { RotateAllDueUseCase } from './application/use-cases/rotate-all-due.use-case';
import { AppLoggerService } from './infrastructure/external/logger.service';
import { KubernetesSecretService } from './infrastructure/external/kubernetes-secret.service';

@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [RotationController],
  providers: [
    // Infrastructure Services
    AppLoggerService,
    KubernetesSecretService,
    // Domain Services
    SecretRotationDomainService,
    // Use Cases
    RotateSecretUseCase,
    GetRotationStatusUseCase,
    RotateAllDueUseCase,
  ],
})
export class AppModule {}

