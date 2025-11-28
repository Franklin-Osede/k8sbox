import { Injectable } from '@nestjs/common';
import { PDBEntity } from '../../domain/entities/pdb-entity';
import { KubernetesPDBService } from '../../infrastructure/external/kubernetes-pdb.service';

/**
 * Use Case: GetPDBStatusUseCase
 * Application layer use case for getting PDB status
 */
@Injectable()
export class GetPDBStatusUseCase {
  constructor(private readonly kubernetesPDBService: KubernetesPDBService) {}

  async execute(name: string, namespace: string): Promise<PDBEntity | null> {
    return this.kubernetesPDBService.getPDBStatus(name, namespace);
  }
}

