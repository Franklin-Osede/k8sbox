import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsArray, IsOptional, IsObject, IsEnum, IsNumber } from 'class-validator';

export enum RuleDirectionDto {
  INGRESS = 'Ingress',
  EGRESS = 'Egress',
}

export enum RuleActionDto {
  ALLOW = 'Allow',
  DENY = 'Deny',
}

export class NetworkRuleDto {
  @ApiProperty({ enum: RuleDirectionDto })
  @IsEnum(RuleDirectionDto)
  direction: RuleDirectionDto;

  @ApiProperty({ enum: RuleActionDto })
  @IsEnum(RuleActionDto)
  action: RuleActionDto;

  @ApiProperty({ required: false })
  @IsArray()
  @IsOptional()
  from?: Array<{
    podSelector?: Record<string, string>;
    namespaceSelector?: Record<string, string>;
  }>;

  @ApiProperty({ required: false })
  @IsArray()
  @IsOptional()
  to?: Array<{
    podSelector?: Record<string, string>;
    namespaceSelector?: Record<string, string>;
  }>;

  @ApiProperty({ required: false })
  @IsArray()
  @IsOptional()
  ports?: Array<{
    protocol: string;
    port?: number;
  }>;
}

export class CreatePolicyDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  namespace: string;

  @ApiProperty()
  @IsObject()
  podSelector: Record<string, string>;

  @ApiProperty()
  @IsArray()
  rules: NetworkRuleDto[];

  @ApiProperty({ required: false })
  @IsArray()
  @IsOptional()
  policyTypes?: Array<'Ingress' | 'Egress'>;
}

export class PolicyDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  namespace: string;

  @ApiProperty()
  podSelector: Record<string, string>;

  @ApiProperty()
  rules: NetworkRuleDto[];

  @ApiProperty()
  policyTypes: Array<'Ingress' | 'Egress'>;

  @ApiProperty()
  hasIngressRules: boolean;

  @ApiProperty()
  hasEgressRules: boolean;
}

