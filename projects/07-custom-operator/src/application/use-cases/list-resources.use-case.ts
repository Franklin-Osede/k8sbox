import { Injectable } from '@nestjs/common';
import { CustomResourceEntity } from '../../domain/entities/custom-resource-entity';
import { KubernetesCRDService } from '../../infrastructure/external/kubernetes-crd.service';

/**
 * Use Case: ListResourcesUseCase
 * Application layer use case for listing custom resources
 */
@Injectable()
export class ListResourcesUseCase {
  constructor(private readonly crdService: KubernetesCRDService) {}

  async execute(namespace?: string): Promise<CustomResourceEntity[]> {
    return this.crdService.listCustomResources(namespace);
  }
}

