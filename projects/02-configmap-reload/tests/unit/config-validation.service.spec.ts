import { Test, TestingModule } from '@nestjs/testing';
import { ConfigValidationService, ConfigSchema } from '../../src/infrastructure/external/config-validation.service';
import { AppLoggerService } from '../../src/infrastructure/external/logger.service';

describe('ConfigValidationService', () => {
  let service: ConfigValidationService;
  let logger: AppLoggerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConfigValidationService,
        AppLoggerService,
      ],
    }).compile();

    service = module.get<ConfigValidationService>(ConfigValidationService);
    logger = module.get<AppLoggerService>(AppLoggerService);
  });

  describe('validate', () => {
    it('should validate config against schema', () => {
      const schema: ConfigSchema = {
        'app.properties': {
          type: 'string',
          required: true,
        },
      };

      service.setSchema(schema);

      const config = { 'app.properties': 'app.name=test' };
      const result = service.validate(config);

      expect(result.valid).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    it('should fail validation for missing required field', () => {
      const schema: ConfigSchema = {
        'app.properties': {
          type: 'string',
          required: true,
        },
      };

      service.setSchema(schema);

      const config = {};
      const result = service.validate(config);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should validate string length constraints', () => {
      const schema: ConfigSchema = {
        'app.properties': {
          type: 'string',
          minLength: 5,
          maxLength: 10,
        },
      };

      service.setSchema(schema);

      const configShort = { 'app.properties': 'abc' };
      const resultShort = service.validate(configShort);
      expect(resultShort.valid).toBe(false);

      const configLong = { 'app.properties': 'this is too long' };
      const resultLong = service.validate(configLong);
      expect(resultLong.valid).toBe(false);

      const configValid = { 'app.properties': 'valid' };
      const resultValid = service.validate(configValid);
      expect(resultValid.valid).toBe(true);
    });

    it('should validate pattern', () => {
      const schema: ConfigSchema = {
        'app.properties': {
          type: 'string',
          pattern: '^app\\..*=.*$',
        },
      };

      service.setSchema(schema);

      const configValid = { 'app.properties': 'app.name=test' };
      const resultValid = service.validate(configValid);
      expect(resultValid.valid).toBe(true);

      const configInvalid = { 'app.properties': 'invalid format' };
      const resultInvalid = service.validate(configInvalid);
      expect(resultInvalid.valid).toBe(false);
    });
  });
});

