import { Injectable } from '@nestjs/common';
import { CustomResourceEntity } from '../../domain/entities/custom-resource-entity';
import { KubernetesCRDService } from '../../infrastructure/external/kubernetes-crd.service';

/**
 * Use Case: GetResourceUseCase
 * Application layer use case for getting a custom resource
 */
@Injectable()
export class GetResourceUseCase {
  constructor(private readonly crdService: KubernetesCRDService) {}

  async execute(name: string, namespace: string): Promise<CustomResourceEntity | null> {
    return this.crdService.getCustomResource(name, namespace);
  }
}

