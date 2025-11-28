import { Controller, Get, Post, HttpCode, HttpStatus, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { GetConfigUseCase } from '../../application/use-cases/get-config.use-case';
import { ReloadConfigUseCase } from '../../application/use-cases/reload-config.use-case';
import { RollbackConfigUseCase } from '../../application/use-cases/rollback-config.use-case';
import { GetConfigHistoryUseCase } from '../../application/use-cases/get-config-history.use-case';
import { ValidateConfigUseCase } from '../../application/use-cases/validate-config.use-case';
import { ConfigResponseDto } from '../dto/config-response.dto';
import { ConfigHistoryResponseDto, ConfigDiffDto, ValidationResponseDto } from '../dto/config-version.dto';
import { ConfigVersioningService } from '../../infrastructure/external/config-versioning.service';

/**
 * Controller: ConfigController
 * Presentation layer controller for configuration endpoints
 */
@ApiTags('config')
@Controller('config')
export class ConfigController {
  constructor(
    private readonly getConfigUseCase: GetConfigUseCase,
    private readonly reloadConfigUseCase: ReloadConfigUseCase,
    private readonly rollbackConfigUseCase: RollbackConfigUseCase,
    private readonly getConfigHistoryUseCase: GetConfigHistoryUseCase,
    private readonly validateConfigUseCase: ValidateConfigUseCase,
    private readonly versioningService: ConfigVersioningService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get current configuration' })
  @ApiResponse({ status: 200, description: 'Current configuration', type: ConfigResponseDto })
  async getConfig(): Promise<ConfigResponseDto> {
    const configState = this.getConfigUseCase.execute();

    return {
      config: configState.getAll(),
      lastReload: configState.getLastReload()?.toISOString() || null,
      reloadCount: configState.getReloadCount(),
      configSize: configState.getSize(),
    };
  }

  @Post('reload')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Manually reload configuration from ConfigMap' })
  @ApiResponse({ status: 200, description: 'Configuration reloaded', type: ConfigResponseDto })
  async reloadConfig(): Promise<ConfigResponseDto> {
    const configState = await this.reloadConfigUseCase.execute();

    return {
      config: configState.getAll(),
      lastReload: configState.getLastReload()?.toISOString() || null,
      reloadCount: configState.getReloadCount(),
      configSize: configState.getSize(),
    };
  }

  @Get('history')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get configuration version history' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Configuration history', type: ConfigHistoryResponseDto })
  async getHistory(@Query('limit') limit?: number): Promise<ConfigHistoryResponseDto> {
    const historyLimit = limit ? parseInt(limit.toString(), 10) : 10;
    const versions = this.getConfigHistoryUseCase.execute(historyLimit);
    const currentVersion = this.versioningService.getCurrentVersion();

    return {
      versions: versions.map((v) => ({
        version: v.version,
        config: v.config,
        timestamp: v.timestamp.toISOString(),
        checksum: v.checksum,
      })),
      currentVersion: currentVersion?.version || 0,
    };
  }

  @Post('rollback/:version')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rollback configuration to a specific version' })
  @ApiParam({ name: 'version', type: Number })
  @ApiResponse({ status: 200, description: 'Configuration rolled back' })
  async rollback(@Param('version') version: string): Promise<ConfigResponseDto> {
    const versionNumber = parseInt(version, 10);
    const rollbackVersion = await this.rollbackConfigUseCase.execute(versionNumber);

    if (!rollbackVersion) {
      throw new Error(`Version ${versionNumber} not found`);
    }

    const configState = this.getConfigUseCase.execute();

    return {
      config: configState.getAll(),
      lastReload: configState.getLastReload()?.toISOString() || null,
      reloadCount: configState.getReloadCount(),
      configSize: configState.getSize(),
    };
  }

  @Get('diff/:version1/:version2')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Compare two configuration versions' })
  @ApiParam({ name: 'version1', type: Number })
  @ApiParam({ name: 'version2', type: Number })
  @ApiResponse({ status: 200, description: 'Configuration diff', type: ConfigDiffDto })
  async getDiff(
    @Param('version1') version1: string,
    @Param('version2') version2: string,
  ): Promise<ConfigDiffDto> {
    const v1 = parseInt(version1, 10);
    const v2 = parseInt(version2, 10);

    const diff = this.versioningService.compareVersions(v1, v2);

    return {
      added: diff.added,
      removed: diff.removed,
      changed: diff.changed,
    };
  }

  @Post('validate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Validate configuration without applying' })
  @ApiBody({ schema: { type: 'object', additionalProperties: { type: 'string' } } })
  @ApiResponse({ status: 200, description: 'Validation result', type: ValidationResponseDto })
  async validate(@Body() config: Record<string, string>): Promise<ValidationResponseDto> {
    const result = this.validateConfigUseCase.execute(config);

    return {
      valid: result.valid,
      errors: result.errors,
    };
  }
}

