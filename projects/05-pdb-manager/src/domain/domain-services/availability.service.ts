import { Injectable } from '@nestjs/common';
import { PDBEntity } from '../entities/pdb-entity';
import { PDBStatusVO, PDBStatusType } from '../value-objects/pdb-status.vo';
import { KubernetesPDBService } from '../../infrastructure/external/kubernetes-pdb.service';
import { AppLoggerService } from '../../infrastructure/external/logger.service';

/**
 * Domain Service: AvailabilityDomainService
 * Core business logic for availability and PDB management
 */
@Injectable()
export class AvailabilityDomainService {
  constructor(
    private readonly kubernetesPDBService: KubernetesPDBService,
    private readonly logger: AppLoggerService,
  ) {}

  /**
   * Calculate availability percentage
   */
  calculateAvailability(currentHealthy: number, desiredHealthy: number): number {
    if (desiredHealthy === 0) return 0;
    return (currentHealthy / desiredHealthy) * 100;
  }

  /**
   * Check if PDB is maintaining availability
   */
  isMaintainingAvailability(pdb: PDBEntity): boolean {
    if (!pdb.status) return false;

    const availabilityPercentage = pdb.getAvailabilityPercentage();
    const threshold = parseFloat(process.env.AVAILABILITY_THRESHOLD || '80');

    return availabilityPercentage >= threshold && pdb.isHealthy();
  }

  /**
   * Get availability summary for namespace
   */
  async getAvailabilitySummary(namespace: string): Promise<{
    totalPDBs: number;
    healthyPDBs: number;
    violatedPDBs: number;
    averageAvailability: number;
  }> {
    const pdbs = await this.kubernetesPDBService.listPDBs(namespace);

    const healthy = pdbs.filter((p) => p.isHealthy()).length;
    const violated = pdbs.filter((p) => p.isViolated()).length;
    const totalAvailability = pdbs.reduce((sum, p) => sum + p.getAvailabilityPercentage(), 0);
    const averageAvailability = pdbs.length > 0 ? totalAvailability / pdbs.length : 0;

    return {
      totalPDBs: pdbs.length,
      healthyPDBs: healthy,
      violatedPDBs: violated,
      averageAvailability: Math.round(averageAvailability * 100) / 100,
    };
  }

  /**
   * Validate PDB configuration
   */
  validatePDBConfiguration(pdb: PDBEntity): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!pdb.name || pdb.name.trim().length === 0) {
      errors.push('PDB name is required');
    }

    if (!pdb.namespace || pdb.namespace.trim().length === 0) {
      errors.push('PDB namespace is required');
    }

    if (!pdb.selector || Object.keys(pdb.selector).length === 0) {
      errors.push('PDB selector is required');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

