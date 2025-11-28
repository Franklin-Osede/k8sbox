/**
 * Value Object: PDBStatus
 * Represents Pod Disruption Budget status
 */
export enum PDBStatusType {
  HEALTHY = 'healthy',
  VIOLATED = 'violated',
  PENDING = 'pending',
}

export class PDBStatusVO {
  constructor(
    public readonly status: PDBStatusType,
    public readonly currentHealthy: number,
    public readonly desiredHealthy: number,
    public readonly disruptedPods: number,
    public readonly allowedDisruptions: number,
    public readonly observedGeneration?: number,
  ) {}

  static healthy(
    currentHealthy: number,
    desiredHealthy: number,
    allowedDisruptions: number,
  ): PDBStatusVO {
    return new PDBStatusVO(
      PDBStatusType.HEALTHY,
      currentHealthy,
      desiredHealthy,
      0,
      allowedDisruptions,
    );
  }

  static violated(
    currentHealthy: number,
    desiredHealthy: number,
    disruptedPods: number,
    allowedDisruptions: number,
  ): PDBStatusVO {
    return new PDBStatusVO(
      PDBStatusType.VIOLATED,
      currentHealthy,
      desiredHealthy,
      disruptedPods,
      allowedDisruptions,
    );
  }

  static pending(
    currentHealthy: number,
    desiredHealthy: number,
  ): PDBStatusVO {
    return new PDBStatusVO(
      PDBStatusType.PENDING,
      currentHealthy,
      desiredHealthy,
      0,
      0,
    );
  }

  isHealthy(): boolean {
    return this.status === PDBStatusType.HEALTHY;
  }

  isViolated(): boolean {
    return this.status === PDBStatusType.VIOLATED;
  }

  getAvailabilityPercentage(): number {
    if (this.desiredHealthy === 0) return 0;
    return (this.currentHealthy / this.desiredHealthy) * 100;
  }
}

