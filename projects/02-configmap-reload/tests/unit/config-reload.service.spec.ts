import { Test, TestingModule } from '@nestjs/testing';
import { ConfigReloadDomainService } from '../../src/domain/domain-services/config-reload.service';
import { AppLoggerService } from '../../src/infrastructure/external/logger.service';
import { ConfigVersioningService } from '../../src/infrastructure/external/config-versioning.service';
import { ConfigValidationService } from '../../src/infrastructure/external/config-validation.service';
import * as fs from 'fs/promises';
import * as path from 'path';

jest.mock('fs/promises');

describe('ConfigReloadDomainService', () => {
  let service: ConfigReloadDomainService;
  let logger: AppLoggerService;
  let versioningService: ConfigVersioningService;
  let validationService: ConfigValidationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConfigReloadDomainService,
        AppLoggerService,
        ConfigVersioningService,
        ConfigValidationService,
      ],
    }).compile();

    service = module.get<ConfigReloadDomainService>(ConfigReloadDomainService);
    logger = module.get<AppLoggerService>(AppLoggerService);
    versioningService = module.get<ConfigVersioningService>(ConfigVersioningService);
    validationService = module.get<ConfigValidationService>(ConfigValidationService);
    
    // Reset mocks
    jest.clearAllMocks();
  });

  describe('loadConfig', () => {
    it('should load config from volume', async () => {
      const mockFiles = ['app.properties', 'database.properties'];
      const mockConfig = {
        'app.properties': 'app.name=test',
        'database.properties': 'db.host=localhost',
      };

      (fs.access as jest.Mock).mockResolvedValue(undefined);
      (fs.readdir as jest.Mock).mockResolvedValue(mockFiles);
      (fs.stat as jest.Mock).mockImplementation((filePath) => {
        return Promise.resolve({ isFile: () => true });
      });
      (fs.readFile as jest.Mock).mockImplementation((filePath) => {
        const fileName = path.basename(filePath);
        return Promise.resolve(mockConfig[fileName] || '');
      });

      const configState = await service.loadConfig();

      expect(configState.getSize()).toBe(2);
      expect(configState.get('app.properties')).toBe('app.name=test');
      expect(configState.get('database.properties')).toBe('db.host=localhost');
    });

    it('should handle missing config directory gracefully', async () => {
      (fs.access as jest.Mock).mockRejectedValue({ code: 'ENOENT' });

      const configState = await service.loadConfig();

      expect(configState.getSize()).toBe(0);
    });

    it('should handle read errors gracefully', async () => {
      const mockFiles = ['app.properties', 'error.properties'];

      (fs.access as jest.Mock).mockResolvedValue(undefined);
      (fs.readdir as jest.Mock).mockResolvedValue(mockFiles);
      (fs.stat as jest.Mock).mockImplementation((filePath) => {
        return Promise.resolve({ isFile: () => true });
      });
      (fs.readFile as jest.Mock).mockImplementation((filePath) => {
        const fileName = path.basename(filePath);
        if (fileName === 'error.properties') {
          return Promise.reject(new Error('Read error'));
        }
        return Promise.resolve('app.name=test');
      });

      const configState = await service.loadConfig();

      // Should still load the successful file
      expect(configState.get('app.properties')).toBe('app.name=test');
    });
  });

  describe('getConfigState', () => {
    it('should return current config state', () => {
      const configState = service.getConfigState();
      
      expect(configState).toBeDefined();
      expect(configState).toBeInstanceOf(Object);
    });
  });

  describe('getConfigValue', () => {
    it('should return config value for existing key', async () => {
      const mockFiles = ['app.properties'];
      (fs.access as jest.Mock).mockResolvedValue(undefined);
      (fs.readdir as jest.Mock).mockResolvedValue(mockFiles);
      (fs.stat as jest.Mock).mockResolvedValue({ isFile: () => true });
      (fs.readFile as jest.Mock).mockResolvedValue('app.name=test');

      await service.loadConfig();
      const value = service.getConfigValue('app.properties');

      expect(value).toBe('app.name=test');
    });

    it('should return undefined for non-existing key', () => {
      const value = service.getConfigValue('nonexistent');
      
      expect(value).toBeUndefined();
    });
  });
});

