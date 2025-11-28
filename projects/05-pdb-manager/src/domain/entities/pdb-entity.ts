import { AvailabilityLevelVO } from '../value-objects/availability-level.vo';
import { PDBStatusVO } from '../value-objects/pdb-status.vo';

/**
 * Domain Entity: PDBEntity
 * Represents a Pod Disruption Budget
 */
export class PDBEntity {
  constructor(
    public readonly name: string,
    public readonly namespace: string,
    public readonly availabilityLevel: AvailabilityLevelVO,
    public readonly selector: Record<string, string>,
    public readonly status?: PDBStatusVO,
  ) {
    if (!name || name.trim().length === 0) {
      throw new Error('PDB name cannot be empty');
    }
    if (!namespace || namespace.trim().length === 0) {
      throw new Error('PDB namespace cannot be empty');
    }
    if (!selector || Object.keys(selector).length === 0) {
      throw new Error('PDB selector cannot be empty');
    }
  }

  static create(
    name: string,
    namespace: string,
    availabilityLevel: AvailabilityLevelVO,
    selector: Record<string, string>,
  ): PDBEntity {
    return new PDBEntity(name, namespace, availabilityLevel, selector);
  }

  updateStatus(status: PDBStatusVO): PDBEntity {
    return new PDBEntity(
      this.name,
      this.namespace,
      this.availabilityLevel,
      this.selector,
      status,
    );
  }

  isHealthy(): boolean {
    return this.status?.isHealthy() ?? false;
  }

  isViolated(): boolean {
    return this.status?.isViolated() ?? false;
  }

  getAvailabilityPercentage(): number {
    return this.status?.getAvailabilityPercentage() ?? 0;
  }
}

