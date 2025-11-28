import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEnum, IsOptional, IsObject, IsBoolean } from 'class-validator';

export enum EnvironmentTypeDto {
  DEV = 'dev',
  STAGING = 'staging',
  PROD = 'prod',
}

export class SyncPolicyDto {
  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  automated?: boolean;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  prune?: boolean;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  selfHeal?: boolean;
}

export class CreateDeploymentDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ enum: EnvironmentTypeDto })
  @IsEnum(EnvironmentTypeDto)
  environment: EnvironmentTypeDto;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  gitRepo: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  gitPath: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  namespace: string;

  @ApiProperty({ required: false, default: 'HEAD' })
  @IsString()
  @IsOptional()
  targetRevision?: string;

  @ApiProperty({ required: false })
  @IsObject()
  @IsOptional()
  syncPolicy?: SyncPolicyDto;
}

export class DeploymentStatusDto {
  @ApiProperty()
  status: string;

  @ApiProperty()
  message?: string;

  @ApiProperty()
  syncedAt?: string;

  @ApiProperty()
  revision?: string;
}

export class DeploymentDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  environment: string;

  @ApiProperty()
  gitRepo: string;

  @ApiProperty()
  gitPath: string;

  @ApiProperty()
  namespace: string;

  @ApiProperty()
  targetRevision: string;

  @ApiProperty()
  syncPolicy?: SyncPolicyDto;

  @ApiProperty()
  status: DeploymentStatusDto;

  @ApiProperty()
  health?: {
    status: string;
    message?: string;
  };

  @ApiProperty()
  isSynced: boolean;

  @ApiProperty()
  isHealthy: boolean;

  @ApiProperty()
  needsSync: boolean;
}

