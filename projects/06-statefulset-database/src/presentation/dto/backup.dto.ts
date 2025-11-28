import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';

export enum BackupTypeDto {
  MANUAL = 'manual',
  SCHEDULED = 'scheduled',
}

export class CreateBackupDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  databaseName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  namespace: string;

  @ApiProperty({ enum: BackupTypeDto, default: BackupTypeDto.MANUAL })
  @IsEnum(BackupTypeDto)
  @IsOptional()
  backupType?: BackupTypeDto;
}

export class BackupStatusDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  databaseName: string;

  @ApiProperty()
  namespace: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  backupType: string;

  @ApiProperty()
  startedAt?: string;

  @ApiProperty()
  completedAt?: string;

  @ApiProperty()
  error?: string;

  @ApiProperty()
  snapshotName?: string;

  @ApiProperty()
  snapshotSize?: number;

  @ApiProperty()
  snapshotReady?: boolean;

  @ApiProperty()
  isCompleted: boolean;

  @ApiProperty()
  isFailed: boolean;
}

export class StatefulSetStatusDto {
  @ApiProperty()
  readyReplicas: number;

  @ApiProperty()
  replicas: number;

  @ApiProperty()
  currentReplicas: number;

  @ApiProperty()
  updatedReplicas: number;
}

export class SnapshotDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  volumeSnapshotName: string;

  @ApiProperty()
  pvcName: string;

  @ApiProperty()
  size: number;

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  readyToUse: boolean;
}

