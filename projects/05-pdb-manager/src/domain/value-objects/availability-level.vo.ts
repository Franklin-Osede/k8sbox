/**
 * Value Object: AvailabilityLevel
 * Represents availability level (minAvailable or maxUnavailable)
 */
export enum AvailabilityType {
  MIN_AVAILABLE = 'minAvailable',
  MAX_UNAVAILABLE = 'maxUnavailable',
}

export class AvailabilityLevelVO {
  constructor(
    public readonly type: AvailabilityType,
    public readonly value: number,
  ) {
    if (value < 0) {
      throw new Error('Availability value cannot be negative');
    }
    if (type === AvailabilityType.MIN_AVAILABLE && value < 1) {
      throw new Error('minAvailable must be at least 1');
    }
  }

  static minAvailable(value: number): AvailabilityLevelVO {
    return new AvailabilityLevelVO(AvailabilityType.MIN_AVAILABLE, value);
  }

  static maxUnavailable(value: number): AvailabilityLevelVO {
    return new AvailabilityLevelVO(AvailabilityType.MAX_UNAVAILABLE, value);
  }

  static percentage(maxUnavailablePercent: number): AvailabilityLevelVO {
    if (maxUnavailablePercent < 0 || maxUnavailablePercent > 100) {
      throw new Error('Percentage must be between 0 and 100');
    }
    return new AvailabilityLevelVO(AvailabilityType.MAX_UNAVAILABLE, maxUnavailablePercent);
  }

  equals(other: AvailabilityLevelVO): boolean {
    return this.type === other.type && this.value === other.value;
  }
}

