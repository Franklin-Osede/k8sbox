import { Injectable } from '@nestjs/common';
import { CustomResourceEntity } from '../../domain/entities/custom-resource-entity';
import { ReconciliationDomainService } from '../../domain/domain-services/reconciliation.service';

/**
 * Use Case: ReconcileResourceUseCase
 * Application layer use case for reconciling custom resources
 */
@Injectable()
export class ReconcileResourceUseCase {
  constructor(private readonly reconciliationService: ReconciliationDomainService) {}

  async execute(resource: CustomResourceEntity): Promise<CustomResourceEntity> {
    // Validate resource
    const validation = this.reconciliationService.validateForReconciliation(resource);
    if (!validation.valid) {
      throw new Error(`Invalid resource: ${validation.errors.join(', ')}`);
    }

    // Reconcile resource
    return this.reconciliationService.reconcile(resource);
  }
}

