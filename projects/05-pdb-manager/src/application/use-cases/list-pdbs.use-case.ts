import { Injectable } from '@nestjs/common';
import { PDBEntity } from '../../domain/entities/pdb-entity';
import { KubernetesPDBService } from '../../infrastructure/external/kubernetes-pdb.service';

/**
 * Use Case: ListPDBsUseCase
 * Application layer use case for listing PDBs
 */
@Injectable()
export class ListPDBsUseCase {
  constructor(private readonly kubernetesPDBService: KubernetesPDBService) {}

  async execute(namespace: string): Promise<PDBEntity[]> {
    return this.kubernetesPDBService.listPDBs(namespace);
  }
}

