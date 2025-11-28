import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import * as chokidar from 'chokidar';
import { ConfigReloadDomainService } from '../../domain/domain-services/config-reload.service';
import { AppLoggerService } from './logger.service';

/**
 * Infrastructure Service: FileWatcherService
 * Watches ConfigMap volume for changes using chokidar
 */
@Injectable()
export class FileWatcherService implements OnModuleInit, OnModuleDestroy {
  private watcher: chokidar.FSWatcher | null = null;
  private readonly configPath: string;

  constructor(
    private readonly configReloadService: ConfigReloadDomainService,
    private readonly logger: AppLoggerService,
  ) {
    this.configPath = process.env.CONFIG_PATH || '/config';
  }

  async onModuleInit() {
    await this.startWatching();
  }

  async onModuleDestroy() {
    await this.stopWatching();
  }

  /**
   * Starts watching the config directory for changes
   */
  private async startWatching(): Promise<void> {
    try {
      this.watcher = chokidar.watch(this.configPath, {
        persistent: true,
        ignoreInitial: false,
        awaitWriteFinish: {
          stabilityThreshold: 500,
          pollInterval: 100,
        },
      });

      this.watcher.on('change', async (filePath) => {
        this.logger.log(`Config file changed: ${filePath}`, 'FileWatcherService');
        try {
          await this.configReloadService.reloadConfig();
          this.logger.log('Configuration reloaded successfully', 'FileWatcherService');
        } catch (error) {
          this.logger.error(`Failed to reload config: ${error.message}`, error.stack, 'FileWatcherService');
        }
      });

      this.watcher.on('add', async (filePath) => {
        this.logger.log(`Config file added: ${filePath}`, 'FileWatcherService');
        try {
          await this.configReloadService.reloadConfig();
        } catch (error) {
          this.logger.error(`Failed to reload config: ${error.message}`, error.stack, 'FileWatcherService');
        }
      });

      this.watcher.on('unlink', async (filePath) => {
        this.logger.log(`Config file removed: ${filePath}`, 'FileWatcherService');
        try {
          await this.configReloadService.reloadConfig();
        } catch (error) {
          this.logger.error(`Failed to reload config: ${error.message}`, error.stack, 'FileWatcherService');
        }
      });

      this.logger.log(`Watching config directory: ${this.configPath}`, 'FileWatcherService');
    } catch (error) {
      this.logger.warn(`Failed to start file watcher: ${error.message}`, 'FileWatcherService');
      // Don't throw - allow app to start even if watcher fails
    }
  }

  /**
   * Stops watching the config directory
   */
  private async stopWatching(): Promise<void> {
    if (this.watcher) {
      await this.watcher.close();
      this.watcher = null;
      this.logger.log('File watcher stopped', 'FileWatcherService');
    }
  }
}

