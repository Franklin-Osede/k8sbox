import { ResourceStatusVO } from '../value-objects/resource-status.vo';
import { ResourceSpecVO } from '../value-objects/resource-spec.vo';

/**
 * Domain Entity: CustomResourceEntity
 * Represents a custom Kubernetes resource
 */
export class CustomResourceEntity {
  constructor(
    public readonly name: string,
    public readonly namespace: string,
    public readonly spec: ResourceSpecVO,
    public readonly status: ResourceStatusVO,
    public readonly generation: number = 1,
    public readonly uid?: string,
  ) {
    if (!name || name.trim().length === 0) {
      throw new Error('Resource name cannot be empty');
    }
    if (!namespace || namespace.trim().length === 0) {
      throw new Error('Namespace cannot be empty');
    }
  }

  static create(
    name: string,
    namespace: string,
    spec: ResourceSpecVO,
    generation: number = 1,
    uid?: string,
  ): CustomResourceEntity {
    return new CustomResourceEntity(
      name,
      namespace,
      spec,
      ResourceStatusVO.pending(),
      generation,
      uid,
    );
  }

  updateStatus(status: ResourceStatusVO): CustomResourceEntity {
    return new CustomResourceEntity(
      this.name,
      this.namespace,
      this.spec,
      status,
      this.generation,
      this.uid,
    );
  }

  updateSpec(spec: ResourceSpecVO, generation: number): CustomResourceEntity {
    return new CustomResourceEntity(
      this.name,
      this.namespace,
      spec,
      this.status,
      generation,
      this.uid,
    );
  }

  isReady(): boolean {
    return this.status.isReady();
  }

  isFailed(): boolean {
    return this.status.isFailed();
  }

  needsReconciliation(): boolean {
    return (
      this.status.isPending() ||
      this.status.isReconciling() ||
      (this.status.observedGeneration !== undefined &&
        this.status.observedGeneration < this.generation)
    );
  }
}

