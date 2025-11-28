import { Injectable } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';
import { ConfigStateEntity } from '../entities/config-state.entity';
import { ConfigValue } from '../value-objects/config-value.vo';
import { AppLoggerService } from '../../infrastructure/external/logger.service';
import { ConfigVersioningService } from '../../infrastructure/external/config-versioning.service';
import { ConfigValidationService } from '../../infrastructure/external/config-validation.service';

/**
 * Domain Service: ConfigReloadDomainService
 * Core business logic for configuration reloading
 */
@Injectable()
export class ConfigReloadDomainService {
  private configState: ConfigStateEntity;
  private readonly configPath: string;

  constructor(
    private readonly logger: AppLoggerService,
    private readonly versioningService: ConfigVersioningService,
    private readonly validationService: ConfigValidationService,
  ) {
    this.configPath = process.env.CONFIG_PATH || '/config';
    this.configState = new ConfigStateEntity();
  }

  /**
   * Loads configuration from mounted ConfigMap volume
   */
  async loadConfig(): Promise<ConfigStateEntity> {
    try {
      const config = await this.readConfigFromVolume();
      
      // Validate configuration
      const validation = this.validationService.validate(config);
      if (!validation.valid) {
        const errorMessages = validation.errors.map(e => `${e.key}: ${e.message}`).join(', ');
        this.logger.warn(`Config validation failed: ${errorMessages}`, 'ConfigReloadDomainService');
        // Continue anyway, but log warning
      }

      // Create version before updating
      this.versioningService.createVersion(config);
      
      this.configState.update(config);
      this.logger.log(`Configuration loaded: ${Object.keys(config).length} keys`, 'ConfigReloadDomainService');
      return this.configState;
    } catch (error) {
      this.logger.error(`Failed to load config: ${error.message}`, error.stack, 'ConfigReloadDomainService');
      throw error;
    }
  }

  /**
   * Reloads configuration from volume
   */
  async reloadConfig(): Promise<ConfigStateEntity> {
    return this.loadConfig();
  }

  /**
   * Gets current configuration state
   */
  getConfigState(): ConfigStateEntity {
    return this.configState;
  }

  /**
   * Gets a specific config value
   */
  getConfigValue(key: string): string | undefined {
    return this.configState.get(key);
  }

  /**
   * Reads configuration files from mounted volume
   */
  private async readConfigFromVolume(): Promise<Record<string, string>> {
    const config: Record<string, string> = {};

    try {
      // Check if config directory exists
      await fs.access(this.configPath);

      // Read all files in config directory
      const files = await fs.readdir(this.configPath);

      for (const file of files) {
        const filePath = path.join(this.configPath, file);
        const stat = await fs.stat(filePath);

        // Only read regular files (not directories)
        if (stat.isFile()) {
          try {
            const content = await fs.readFile(filePath, 'utf-8');
            config[file] = content.trim();
          } catch (error) {
            this.logger.warn(`Failed to read config file ${file}: ${error.message}`, 'ConfigReloadDomainService');
          }
        }
      }
    } catch (error) {
      // If config directory doesn't exist, return empty config
      // This allows the app to start even without ConfigMap mounted
      if (error.code === 'ENOENT') {
        this.logger.warn(`Config directory ${this.configPath} not found. Using empty config.`, 'ConfigReloadDomainService');
        return {};
      }
      throw error;
    }

    return config;
  }

  /**
   * Watches for configuration changes
   */
  async watchConfigChanges(
    onChange: (newConfig: Record<string, string>) => void,
  ): Promise<void> {
    // This will be implemented with chokidar in infrastructure layer
    // Domain service just defines the contract
    this.logger.log('Config watching initialized', 'ConfigReloadDomainService');
  }
}

