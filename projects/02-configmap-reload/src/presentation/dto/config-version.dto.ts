import { ApiProperty } from '@nestjs/swagger';

export class ConfigVersionDto {
  @ApiProperty()
  version: number;

  @ApiProperty()
  config: Record<string, string>;

  @ApiProperty()
  timestamp: string;

  @ApiProperty()
  checksum: string;
}

export class ConfigHistoryResponseDto {
  @ApiProperty({ type: [ConfigVersionDto] })
  versions: ConfigVersionDto[];

  @ApiProperty()
  currentVersion: number;
}

export class ConfigDiffDto {
  @ApiProperty()
  added: string[];

  @ApiProperty()
  removed: string[];

  @ApiProperty()
  changed: Array<{
    key: string;
    oldValue: string;
    newValue: string;
  }>;
}

export class ValidationResponseDto {
  @ApiProperty()
  valid: boolean;

  @ApiProperty()
  errors: Array<{
    key: string;
    message: string;
  }>;
}

