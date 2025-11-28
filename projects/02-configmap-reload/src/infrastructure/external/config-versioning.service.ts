import { Injectable } from '@nestjs/common';
import { ConfigVersionEntity } from '../../domain/entities/config-version.entity';
import { AppLoggerService } from './logger.service';

/**
 * Infrastructure Service: ConfigVersioningService
 * Manages configuration versioning and rollback
 */
@Injectable()
export class ConfigVersioningService {
  private versions: ConfigVersionEntity[] = [];
  private currentVersion: number = 0;
  private readonly maxVersions: number;

  constructor(private readonly logger: AppLoggerService) {
    this.maxVersions = parseInt(process.env.CONFIG_MAX_VERSIONS || '50', 10);
  }

  /**
   * Create a new version from current config
   */
  createVersion(config: Record<string, string>): ConfigVersionEntity {
    // Check if config actually changed
    if (this.versions.length > 0) {
      const lastVersion = this.versions[0];
      const newChecksum = this.calculateChecksum(config);
      
      if (lastVersion.checksum === newChecksum) {
        // Config hasn't changed, return existing version
        this.logger.debug('Config unchanged, not creating new version', 'ConfigVersioningService');
        return lastVersion;
      }
    }

    this.currentVersion++;
    const version = ConfigVersionEntity.create(this.currentVersion, config);
    this.versions.unshift(version); // Add to beginning

    // Keep only last N versions
    if (this.versions.length > this.maxVersions) {
      this.versions = this.versions.slice(0, this.maxVersions);
    }

    this.logger.log(`Created config version ${version.version}`, 'ConfigVersioningService');
    return version;
  }

  /**
   * Get version by number
   */
  getVersion(version: number): ConfigVersionEntity | null {
    return this.versions.find((v) => v.version === version) || null;
  }

  /**
   * Get all versions
   */
  getAllVersions(): ConfigVersionEntity[] {
    return [...this.versions];
  }

  /**
   * Get version history (limited)
   */
  getHistory(limit: number = 10): ConfigVersionEntity[] {
    return this.versions.slice(0, limit);
  }

  /**
   * Get current version
   */
  getCurrentVersion(): ConfigVersionEntity | null {
    return this.versions[0] || null;
  }

  /**
   * Rollback to a specific version
   */
  rollbackToVersion(version: number): ConfigVersionEntity | null {
    const targetVersion = this.getVersion(version);
    if (!targetVersion) {
      this.logger.warn(`Version ${version} not found for rollback`, 'ConfigVersioningService');
      return null;
    }

    // Create new version from rollback target
    const rollbackVersion = ConfigVersionEntity.create(
      this.currentVersion + 1,
      targetVersion.config,
    );
    this.versions.unshift(rollbackVersion);

    this.logger.log(`Rolled back to version ${version}, created version ${rollbackVersion.version}`, 'ConfigVersioningService');
    return rollbackVersion;
  }

  /**
   * Compare two versions
   */
  compareVersions(version1: number, version2: number): {
    added: string[];
    removed: string[];
    changed: Array<{ key: string; oldValue: string; newValue: string }>;
  } {
    const v1 = this.getVersion(version1);
    const v2 = this.getVersion(version2);

    if (!v1 || !v2) {
      throw new Error('One or both versions not found');
    }

    const added: string[] = [];
    const removed: string[] = [];
    const changed: Array<{ key: string; oldValue: string; newValue: string }> = [];

    // Find added and changed keys
    Object.keys(v2.config).forEach((key) => {
      if (!(key in v1.config)) {
        added.push(key);
      } else if (v1.config[key] !== v2.config[key]) {
        changed.push({
          key,
          oldValue: v1.config[key],
          newValue: v2.config[key],
        });
      }
    });

    // Find removed keys
    Object.keys(v1.config).forEach((key) => {
      if (!(key in v2.config)) {
        removed.push(key);
      }
    });

    return { added, removed, changed };
  }

  private calculateChecksum(config: Record<string, string>): string {
    const content = JSON.stringify(config, Object.keys(config).sort());
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
  }
}

