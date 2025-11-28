/**
 * Value Object: CircuitState
 * Represents the state of a circuit breaker
 */
export enum CircuitState {
  CLOSED = 'closed',    // Normal operation
  OPEN = 'open',        // Failing, reject requests
  HALF_OPEN = 'half-open', // Testing if service recovered
}

export class CircuitStateVO {
  constructor(
    public readonly state: CircuitState,
    public readonly failureCount: number,
    public readonly lastFailureTime: Date | null,
    public readonly nextAttemptTime: Date | null,
  ) {}

  static closed(): CircuitStateVO {
    return new CircuitStateVO(CircuitState.CLOSED, 0, null, null);
  }

  static open(failureCount: number, lastFailureTime: Date, nextAttemptTime: Date): CircuitStateVO {
    return new CircuitStateVO(CircuitState.OPEN, failureCount, lastFailureTime, nextAttemptTime);
  }

  static halfOpen(): CircuitStateVO {
    return new CircuitStateVO(CircuitState.HALF_OPEN, 0, null, null);
  }

  isClosed(): boolean {
    return this.state === CircuitState.CLOSED;
  }

  isOpen(): boolean {
    return this.state === CircuitState.OPEN;
  }

  isHalfOpen(): boolean {
    return this.state === CircuitState.HALF_OPEN;
  }

  canAttempt(): boolean {
    if (this.isClosed() || this.isHalfOpen()) {
      return true;
    }
    if (this.isOpen() && this.nextAttemptTime) {
      return new Date() >= this.nextAttemptTime;
    }
    return false;
  }
}

