import { Injectable } from '@nestjs/common';
import { PDBEntity } from '../../domain/entities/pdb-entity';
import { AvailabilityDomainService } from '../../domain/domain-services/availability.service';
import { KubernetesPDBService } from '../../infrastructure/external/kubernetes-pdb.service';

/**
 * Use Case: CreatePDBUseCase
 * Application layer use case for creating PDB
 */
@Injectable()
export class CreatePDBUseCase {
  constructor(
    private readonly kubernetesPDBService: KubernetesPDBService,
    private readonly availabilityDomainService: AvailabilityDomainService,
  ) {}

  async execute(pdb: PDBEntity): Promise<PDBEntity> {
    // Validate PDB configuration
    const validation = this.availabilityDomainService.validatePDBConfiguration(pdb);
    if (!validation.valid) {
      throw new Error(`Invalid PDB configuration: ${validation.errors.join(', ')}`);
    }

    // Create PDB in Kubernetes
    await this.kubernetesPDBService.createOrUpdatePDB(pdb);

    // Get status after creation
    const createdPDB = await this.kubernetesPDBService.getPDBStatus(pdb.name, pdb.namespace);
    if (!createdPDB) {
      throw new Error(`Failed to retrieve created PDB ${pdb.name}`);
    }

    return createdPDB;
  }
}

