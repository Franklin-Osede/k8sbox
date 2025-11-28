import { Test, TestingModule } from '@nestjs/testing';
import { ConfigVersioningService } from '../../src/infrastructure/external/config-versioning.service';
import { AppLoggerService } from '../../src/infrastructure/external/logger.service';
import { ConfigVersionEntity } from '../../src/domain/entities/config-version.entity';

describe('ConfigVersioningService', () => {
  let service: ConfigVersioningService;
  let logger: AppLoggerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConfigVersioningService,
        AppLoggerService,
      ],
    }).compile();

    service = module.get<ConfigVersioningService>(ConfigVersioningService);
    logger = module.get<AppLoggerService>(AppLoggerService);
  });

  describe('createVersion', () => {
    it('should create a new version', () => {
      const config = { key1: 'value1' };
      const version = service.createVersion(config);

      expect(version.version).toBe(1);
      expect(version.config).toEqual(config);
      expect(version.checksum).toBeDefined();
    });

    it('should not create duplicate version for same config', () => {
      const config = { key1: 'value1' };
      const version1 = service.createVersion(config);
      const version2 = service.createVersion(config);

      expect(version1.version).toBe(version2.version);
    });

    it('should create new version for changed config', () => {
      const config1 = { key1: 'value1' };
      const config2 = { key1: 'value2' };

      const version1 = service.createVersion(config1);
      const version2 = service.createVersion(config2);

      expect(version2.version).toBeGreaterThan(version1.version);
    });
  });

  describe('getVersion', () => {
    it('should return version by number', () => {
      const config = { key1: 'value1' };
      const version = service.createVersion(config);

      const retrieved = service.getVersion(version.version);

      expect(retrieved).not.toBeNull();
      expect(retrieved?.version).toBe(version.version);
    });

    it('should return null for non-existent version', () => {
      const retrieved = service.getVersion(999);

      expect(retrieved).toBeNull();
    });
  });

  describe('rollbackToVersion', () => {
    it('should rollback to specific version', () => {
      const config1 = { key1: 'value1' };
      const config2 = { key1: 'value2' };

      const version1 = service.createVersion(config1);
      const version2 = service.createVersion(config2);

      const rollback = service.rollbackToVersion(version1.version);

      expect(rollback).not.toBeNull();
      expect(rollback?.config).toEqual(config1);
    });

    it('should return null for non-existent version', () => {
      const rollback = service.rollbackToVersion(999);

      expect(rollback).toBeNull();
    });
  });

  describe('compareVersions', () => {
    it('should compare two versions', () => {
      const config1 = { key1: 'value1', key2: 'value2' };
      const config2 = { key1: 'value1-changed', key3: 'value3' };

      const version1 = service.createVersion(config1);
      const version2 = service.createVersion(config2);

      const diff = service.compareVersions(version1.version, version2.version);

      expect(diff.added).toContain('key3');
      expect(diff.removed).toContain('key2');
      expect(diff.changed.length).toBeGreaterThan(0);
    });
  });
});

