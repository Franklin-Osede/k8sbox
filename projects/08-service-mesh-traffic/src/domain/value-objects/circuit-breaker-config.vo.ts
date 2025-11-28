/**
 * Value Object: CircuitBreakerConfig
 * Represents circuit breaker configuration
 */
export class CircuitBreakerConfigVO {
  constructor(
    public readonly consecutiveErrors: number,
    public readonly intervalSeconds: number,
    public readonly baseEjectionTimeSeconds: number,
    public readonly maxEjectionPercent: number,
    public readonly minHealthPercent: number,
  ) {
    if (consecutiveErrors < 1) {
      throw new Error('Consecutive errors must be at least 1');
    }
    if (intervalSeconds < 1) {
      throw new Error('Interval seconds must be at least 1');
    }
    if (maxEjectionPercent < 0 || maxEjectionPercent > 100) {
      throw new Error('Max ejection percent must be between 0 and 100');
    }
    if (minHealthPercent < 0 || minHealthPercent > 100) {
      throw new Error('Min health percent must be between 0 and 100');
    }
  }

  static create(
    consecutiveErrors: number = 5,
    intervalSeconds: number = 30,
    baseEjectionTimeSeconds: number = 30,
    maxEjectionPercent: number = 50,
    minHealthPercent: number = 50,
  ): CircuitBreakerConfigVO {
    return new CircuitBreakerConfigVO(
      consecutiveErrors,
      intervalSeconds,
      baseEjectionTimeSeconds,
      maxEjectionPercent,
      minHealthPercent,
    );
  }

  static default(): CircuitBreakerConfigVO {
    return CircuitBreakerConfigVO.create();
  }

  static strict(): CircuitBreakerConfigVO {
    return new CircuitBreakerConfigVO(3, 10, 60, 75, 75);
  }
}

