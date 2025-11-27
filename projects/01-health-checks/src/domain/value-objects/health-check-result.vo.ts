/**
 * Value Object: HealthCheckResult
 * Immutable result of a health check
 */
export class HealthCheckResult {
  constructor(
    public readonly isHealthy: boolean,
    public readonly message: string,
    public readonly data?: Record<string, any>,
  ) {
    if (!message || message.trim().length === 0) {
      throw new Error('Health check message cannot be empty');
    }
  }

  static healthy(message: string = 'OK', data?: Record<string, any>): HealthCheckResult {
    return new HealthCheckResult(true, message, data);
  }

  static unhealthy(message: string, data?: Record<string, any>): HealthCheckResult {
    return new HealthCheckResult(false, message, data);
  }

  equals(other: HealthCheckResult): boolean {
    return (
      this.isHealthy === other.isHealthy &&
      this.message === other.message
    );
  }
}

