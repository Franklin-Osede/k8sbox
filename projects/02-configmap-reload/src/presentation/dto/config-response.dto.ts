import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO: ConfigResponseDto
 * Response DTO for configuration endpoints
 */
export class ConfigResponseDto {
  @ApiProperty({ example: { 'key1': 'value1', 'key2': 'value2' } })
  config: Record<string, string>;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  lastReload: string | null;

  @ApiProperty({ example: 5 })
  reloadCount: number;

  @ApiProperty({ example: 2 })
  configSize: number;
}

