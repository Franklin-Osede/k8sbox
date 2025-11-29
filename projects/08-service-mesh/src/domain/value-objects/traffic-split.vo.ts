/**
 * Value Object: TrafficSplit
 * Represents traffic distribution between service versions
 */
export class TrafficSplitVO {
  constructor(
    public readonly v1Weight: number,
    public readonly v2Weight: number,
  ) {
    if (v1Weight < 0 || v1Weight > 100) {
      throw new Error('v1Weight must be between 0 and 100');
    }
    if (v2Weight < 0 || v2Weight > 100) {
      throw new Error('v2Weight must be between 0 and 100');
    }
    if (v1Weight + v2Weight !== 100) {
      throw new Error('Traffic weights must sum to 100');
    }
  }

  static create(v1Weight: number, v2Weight: number): TrafficSplitVO {
    return new TrafficSplitVO(v1Weight, v2Weight);
  }

  static canary(v2Percentage: number): TrafficSplitVO {
    return new TrafficSplitVO(100 - v2Percentage, v2Percentage);
  }

  static fullV1(): TrafficSplitVO {
    return new TrafficSplitVO(100, 0);
  }

  static fullV2(): TrafficSplitVO {
    return new TrafficSplitVO(0, 100);
  }

  isCanary(): boolean {
    return this.v1Weight > 0 && this.v2Weight > 0;
  }

  isFullV1(): boolean {
    return this.v1Weight === 100 && this.v2Weight === 0;
  }

  isFullV2(): boolean {
    return this.v1Weight === 0 && this.v2Weight === 100;
  }
}

