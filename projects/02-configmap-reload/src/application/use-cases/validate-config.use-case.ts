import { Injectable } from '@nestjs/common';
import { ConfigValidationService, ValidationResult } from '../../infrastructure/external/config-validation.service';

/**
 * Use Case: ValidateConfigUseCase
 * Application layer use case for validating configuration
 */
@Injectable()
export class ValidateConfigUseCase {
  constructor(
    private readonly validationService: ConfigValidationService,
  ) {}

  execute(config: Record<string, string>): ValidationResult {
    return this.validationService.validate(config);
  }
}

