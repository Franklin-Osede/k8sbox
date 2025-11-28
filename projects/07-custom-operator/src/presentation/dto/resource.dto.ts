import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, IsOptional, IsObject, Min, Max } from 'class-validator';

export class ResourceSpecDto {
  @ApiProperty()
  @IsNumber()
  @Min(0)
  replicas: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  image: string;

  @ApiProperty()
  @IsNumber()
  @Min(1)
  @Max(65535)
  port: number;

  @ApiProperty({ required: false })
  @IsObject()
  @IsOptional()
  env?: Record<string, string>;
}

export class CreateResourceDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  namespace: string;

  @ApiProperty()
  spec: ResourceSpecDto;
}

export class ResourceStatusDto {
  @ApiProperty()
  status: string;

  @ApiProperty()
  message?: string;

  @ApiProperty()
  lastReconciledAt?: string;

  @ApiProperty()
  observedGeneration?: number;
}

export class ResourceDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  namespace: string;

  @ApiProperty()
  spec: ResourceSpecDto;

  @ApiProperty()
  status: ResourceStatusDto;

  @ApiProperty()
  generation: number;

  @ApiProperty()
  uid?: string;

  @ApiProperty()
  isReady: boolean;

  @ApiProperty()
  isFailed: boolean;
}

