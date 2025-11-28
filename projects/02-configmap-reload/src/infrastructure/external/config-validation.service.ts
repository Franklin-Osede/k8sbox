import { Injectable } from '@nestjs/common';
import { AppLoggerService } from './logger.service';

/**
 * Infrastructure Service: ConfigValidationService
 * Validates configuration against schema
 */
export interface ConfigSchema {
  [key: string]: {
    type: 'string' | 'number' | 'boolean';
    required?: boolean;
    pattern?: string;
    minLength?: number;
    maxLength?: number;
  };
}

export interface ValidationResult {
  valid: boolean;
  errors: Array<{ key: string; message: string }>;
}

@Injectable()
export class ConfigValidationService {
  private schema: ConfigSchema = {};

  constructor(private readonly logger: AppLoggerService) {
    // Load schema from environment or use default
    this.loadSchema();
  }

  /**
   * Set validation schema
   */
  setSchema(schema: ConfigSchema): void {
    this.schema = schema;
    this.logger.log('Validation schema updated', 'ConfigValidationService');
  }

  /**
   * Validate configuration against schema
   */
  validate(config: Record<string, string>): ValidationResult {
    const errors: Array<{ key: string; message: string }> = [];

    // Check required fields
    Object.entries(this.schema).forEach(([key, rule]) => {
      if (rule.required && !(key in config)) {
        errors.push({ key, message: `Required field '${key}' is missing` });
      }
    });

    // Validate existing fields
    Object.entries(config).forEach(([key, value]) => {
      const rule = this.schema[key];
      if (!rule) {
        // Unknown key, but not an error (allow extra keys)
        return;
      }

      // Type validation
      if (rule.type === 'number' && isNaN(Number(value))) {
        errors.push({ key, message: `Field '${key}' must be a number` });
        return;
      }

      if (rule.type === 'boolean' && value !== 'true' && value !== 'false') {
        errors.push({ key, message: `Field '${key}' must be a boolean (true/false)` });
        return;
      }

      // String validations
      if (rule.type === 'string') {
        if (rule.minLength && value.length < rule.minLength) {
          errors.push({
            key,
            message: `Field '${key}' must be at least ${rule.minLength} characters`,
          });
        }

        if (rule.maxLength && value.length > rule.maxLength) {
          errors.push({
            key,
            message: `Field '${key}' must be at most ${rule.maxLength} characters`,
          });
        }

        if (rule.pattern) {
          const regex = new RegExp(rule.pattern);
          if (!regex.test(value)) {
            errors.push({
              key,
              message: `Field '${key}' does not match required pattern`,
            });
          }
        }
      }
    });

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Load schema from environment or use default
   */
  private loadSchema(): void {
    // Default schema - can be overridden via environment
    this.schema = {
      'app.properties': {
        type: 'string',
        required: true,
        minLength: 1,
      },
    };

    // Try to load from environment variable (JSON string)
    const schemaEnv = process.env.CONFIG_SCHEMA;
    if (schemaEnv) {
      try {
        this.schema = JSON.parse(schemaEnv);
      } catch (error) {
        this.logger.warn('Failed to parse CONFIG_SCHEMA, using default', 'ConfigValidationService');
      }
    }
  }
}

