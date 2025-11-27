/**
 * Value Object: DependencyStatus
 * Status of a dependency check
 */
export class DependencyStatus {
  constructor(
    public readonly name: string,
    public readonly healthy: boolean,
    public readonly responseTime?: number,
    public readonly error?: string,
  ) {
    if (!name || name.trim().length === 0) {
      throw new Error('Dependency name cannot be empty');
    }
  }

  static healthy(name: string, responseTime?: number): DependencyStatus {
    return new DependencyStatus(name, true, responseTime);
  }

  static unhealthy(name: string, error: string, responseTime?: number): DependencyStatus {
    return new DependencyStatus(name, false, responseTime, error);
  }
}

