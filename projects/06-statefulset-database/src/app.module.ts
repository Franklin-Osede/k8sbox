import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BackupController } from './presentation/controllers/backup.controller';
import { HealthController } from './presentation/controllers/health.controller';
import { BackupDomainService } from './domain/domain-services/backup.service';
import { CreateBackupUseCase } from './application/use-cases/create-backup.use-case';
import { GetBackupStatusUseCase } from './application/use-cases/get-backup-status.use-case';
import { ListSnapshotsUseCase } from './application/use-cases/list-snapshots.use-case';
import { GetStatefulSetStatusUseCase } from './application/use-cases/get-statefulset-status.use-case';
import { AppLoggerService } from './infrastructure/external/logger.service';
import { KubernetesStatefulSetService } from './infrastructure/external/kubernetes-statefulset.service';
import { KubernetesSnapshotService } from './infrastructure/external/kubernetes-snapshot.service';

@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [BackupController, HealthController],
  providers: [
    // Infrastructure Services
    AppLoggerService,
    KubernetesStatefulSetService,
    KubernetesSnapshotService,
    // Domain Services
    BackupDomainService,
    // Use Cases
    CreateBackupUseCase,
    GetBackupStatusUseCase,
    ListSnapshotsUseCase,
    GetStatefulSetStatusUseCase,
  ],
})
export class AppModule {}

