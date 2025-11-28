/**
 * Value Object: ResourceStatus
 * Represents the status of a custom resource
 */
export enum ResourceStatusType {
  PENDING = 'Pending',
  RECONCILING = 'Reconciling',
  READY = 'Ready',
  FAILED = 'Failed',
  DELETING = 'Deleting',
}

export class ResourceStatusVO {
  constructor(
    public readonly status: ResourceStatusType,
    public readonly message?: string,
    public readonly lastReconciledAt?: Date,
    public readonly observedGeneration?: number,
  ) {}

  static pending(message?: string): ResourceStatusVO {
    return new ResourceStatusVO(ResourceStatusType.PENDING, message);
  }

  static reconciling(message?: string): ResourceStatusVO {
    return new ResourceStatusVO(ResourceStatusType.RECONCILING, message, new Date());
  }

  static ready(message?: string, observedGeneration?: number): ResourceStatusVO {
    return new ResourceStatusVO(
      ResourceStatusType.READY,
      message || 'Resource is ready',
      new Date(),
      observedGeneration,
    );
  }

  static failed(message: string): ResourceStatusVO {
    return new ResourceStatusVO(ResourceStatusType.FAILED, message);
  }

  static deleting(message?: string): ResourceStatusVO {
    return new ResourceStatusVO(ResourceStatusType.DELETING, message || 'Resource is being deleted');
  }

  isReady(): boolean {
    return this.status === ResourceStatusType.READY;
  }

  isFailed(): boolean {
    return this.status === ResourceStatusType.FAILED;
  }

  isReconciling(): boolean {
    return this.status === ResourceStatusType.RECONCILING;
  }

  isPending(): boolean {
    return this.status === ResourceStatusType.PENDING;
  }
}

