import { Controller, Get, Post, Param, Query, Body, HttpCode, HttpStatus, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { CreateBackupUseCase } from '../../application/use-cases/create-backup.use-case';
import { GetBackupStatusUseCase } from '../../application/use-cases/get-backup-status.use-case';
import { ListSnapshotsUseCase } from '../../application/use-cases/list-snapshots.use-case';
import { GetStatefulSetStatusUseCase } from '../../application/use-cases/get-statefulset-status.use-case';
import { BackupEntity } from '../../domain/entities/backup-entity';
import { CreateBackupDto, BackupStatusDto, StatefulSetStatusDto, SnapshotDto } from '../dto/backup.dto';
import { randomUUID } from 'crypto';

/**
 * Controller: BackupController
 * Presentation layer controller for backup endpoints
 */
@ApiTags('backup')
@Controller('backup')
export class BackupController {
  // In-memory storage for backups (in production, use a database)
  private backups: Map<string, BackupEntity> = new Map();

  constructor(
    private readonly createBackupUseCase: CreateBackupUseCase,
    private readonly getBackupStatusUseCase: GetBackupStatusUseCase,
    private readonly listSnapshotsUseCase: ListSnapshotsUseCase,
    private readonly getStatefulSetStatusUseCase: GetStatefulSetStatusUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new backup' })
  @ApiResponse({ status: 201, description: 'Backup created successfully', type: BackupStatusDto })
  async createBackup(@Body() createBackupDto: CreateBackupDto): Promise<BackupStatusDto> {
    const backupId = randomUUID();
    const backup = BackupEntity.create(
      backupId,
      createBackupDto.databaseName,
      createBackupDto.namespace,
      createBackupDto.backupType || 'manual',
    );

    const createdBackup = await this.createBackupUseCase.execute(backup);
    this.backups.set(backupId, createdBackup);

    return this.mapToDto(createdBackup);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get backup status' })
  @ApiParam({ name: 'id', description: 'Backup ID' })
  @ApiResponse({ status: 200, description: 'Backup status', type: BackupStatusDto })
  @ApiResponse({ status: 404, description: 'Backup not found' })
  async getBackupStatus(@Param('id') id: string): Promise<BackupStatusDto> {
    const backup = this.backups.get(id);
    if (!backup) {
      throw new NotFoundException(`Backup ${id} not found`);
    }

    const updatedBackup = await this.getBackupStatusUseCase.execute(backup);
    this.backups.set(id, updatedBackup);

    return this.mapToDto(updatedBackup);
  }

  @Get('statefulset/:name/status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get StatefulSet status' })
  @ApiParam({ name: 'name', description: 'StatefulSet name' })
  @ApiQuery({ name: 'namespace', required: false, description: 'Namespace (default: default)' })
  @ApiResponse({ status: 200, description: 'StatefulSet status', type: StatefulSetStatusDto })
  async getStatefulSetStatus(
    @Param('name') name: string,
    @Query('namespace') namespace: string = 'default',
  ): Promise<StatefulSetStatusDto> {
    const status = await this.getStatefulSetStatusUseCase.execute(name, namespace);
    if (!status) {
      throw new NotFoundException(`StatefulSet ${name} not found in namespace ${namespace}`);
    }
    return status;
  }

  @Get('snapshots/:pvcName')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List snapshots for a PVC' })
  @ApiParam({ name: 'pvcName', description: 'PVC name' })
  @ApiQuery({ name: 'namespace', required: false, description: 'Namespace (default: default)' })
  @ApiResponse({ status: 200, description: 'List of snapshots', type: [SnapshotDto] })
  async listSnapshots(
    @Param('pvcName') pvcName: string,
    @Query('namespace') namespace: string = 'default',
  ): Promise<SnapshotDto[]> {
    const snapshots = await this.listSnapshotsUseCase.execute(pvcName, namespace);
    return snapshots.map((snapshot) => ({
      name: snapshot.name,
      volumeSnapshotName: snapshot.volumeSnapshotName,
      pvcName: snapshot.pvcName,
      size: snapshot.size,
      createdAt: snapshot.createdAt.toISOString(),
      readyToUse: snapshot.readyToUse,
    }));
  }

  private mapToDto(backup: BackupEntity): BackupStatusDto {
    return {
      id: backup.id,
      databaseName: backup.databaseName,
      namespace: backup.namespace,
      status: backup.status.status,
      backupType: backup.backupType,
      startedAt: backup.status.startedAt?.toISOString(),
      completedAt: backup.status.completedAt?.toISOString(),
      error: backup.status.error,
      snapshotName: backup.snapshotInfo?.name,
      snapshotSize: backup.snapshotInfo?.size,
      snapshotReady: backup.snapshotInfo?.readyToUse,
      isCompleted: backup.isCompleted(),
      isFailed: backup.isFailed(),
    };
  }
}

