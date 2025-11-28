import { TrafficSplitVO } from '../value-objects/traffic-split.vo';
import { CircuitBreakerConfigVO } from '../value-objects/circuit-breaker-config.vo';

/**
 * Domain Entity: TrafficRoutingEntity
 * Represents traffic routing configuration for a service
 */
export class TrafficRoutingEntity {
  constructor(
    public readonly serviceName: string,
    public readonly namespace: string,
    public readonly trafficSplit: TrafficSplitVO,
    public readonly circuitBreaker?: CircuitBreakerConfigVO,
    public readonly mTLSEnabled: boolean = true,
    public readonly version: string = 'v1',
  ) {
    if (!serviceName || serviceName.trim().length === 0) {
      throw new Error('Service name cannot be empty');
    }
    if (!namespace || namespace.trim().length === 0) {
      throw new Error('Namespace cannot be empty');
    }
  }

  static create(
    serviceName: string,
    namespace: string,
    trafficSplit: TrafficSplitVO,
    circuitBreaker?: CircuitBreakerConfigVO,
    mTLSEnabled: boolean = true,
  ): TrafficRoutingEntity {
    return new TrafficRoutingEntity(
      serviceName,
      namespace,
      trafficSplit,
      circuitBreaker,
      mTLSEnabled,
      'v1',
    );
  }

  updateTrafficSplit(trafficSplit: TrafficSplitVO): TrafficRoutingEntity {
    return new TrafficRoutingEntity(
      this.serviceName,
      this.namespace,
      trafficSplit,
      this.circuitBreaker,
      this.mTLSEnabled,
      this.version,
    );
  }

  updateCircuitBreaker(circuitBreaker: CircuitBreakerConfigVO): TrafficRoutingEntity {
    return new TrafficRoutingEntity(
      this.serviceName,
      this.namespace,
      this.trafficSplit,
      circuitBreaker,
      this.mTLSEnabled,
      this.version,
    );
  }

  toggleMTLS(): TrafficRoutingEntity {
    return new TrafficRoutingEntity(
      this.serviceName,
      this.namespace,
      this.trafficSplit,
      this.circuitBreaker,
      !this.mTLSEnabled,
      this.version,
    );
  }

  isCanaryDeployment(): boolean {
    return this.trafficSplit.isCanary();
  }
}

