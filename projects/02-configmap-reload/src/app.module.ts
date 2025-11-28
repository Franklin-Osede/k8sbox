import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ConfigController } from './presentation/controllers/config.controller';
import { ConfigReloadDomainService } from './domain/domain-services/config-reload.service';
import { GetConfigUseCase } from './application/use-cases/get-config.use-case';
import { ReloadConfigUseCase } from './application/use-cases/reload-config.use-case';
import { RollbackConfigUseCase } from './application/use-cases/rollback-config.use-case';
import { GetConfigHistoryUseCase } from './application/use-cases/get-config-history.use-case';
import { ValidateConfigUseCase } from './application/use-cases/validate-config.use-case';
import { AppLoggerService } from './infrastructure/external/logger.service';
import { FileWatcherService } from './infrastructure/external/file-watcher.service';
import { ConfigVersioningService } from './infrastructure/external/config-versioning.service';
import { ConfigValidationService } from './infrastructure/external/config-validation.service';

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
  controllers: [ConfigController],
  providers: [
    // Infrastructure Services
    AppLoggerService,
    FileWatcherService,
    ConfigVersioningService,
    ConfigValidationService,
    // Domain Services
    ConfigReloadDomainService,
    // Use Cases
    GetConfigUseCase,
    ReloadConfigUseCase,
    RollbackConfigUseCase,
    GetConfigHistoryUseCase,
    ValidateConfigUseCase,
  ],
})
export class AppModule {}

