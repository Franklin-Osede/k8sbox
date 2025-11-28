import { Injectable } from '@nestjs/common';
import { CircuitStateVO, CircuitState } from '../../domain/value-objects/circuit-state.vo';
import { AppLoggerService } from './logger.service';

/**
 * Infrastructure Service: CircuitBreakerService
 * Implements circuit breaker pattern for dependency health checks
 */
@Injectable()
export class CircuitBreakerService {
  private circuits: Map<string, CircuitStateVO> = new Map();
  private readonly failureThreshold: number;
  private readonly timeoutMs: number;
  private readonly halfOpenMaxAttempts: number;

  constructor(private readonly logger: AppLoggerService) {
    this.failureThreshold = parseInt(process.env.CIRCUIT_BREAKER_FAILURE_THRESHOLD || '5', 10);
    this.timeoutMs = parseInt(process.env.CIRCUIT_BREAKER_TIMEOUT_MS || '60000', 10);
    this.halfOpenMaxAttempts = parseInt(process.env.CIRCUIT_BREAKER_HALF_OPEN_ATTEMPTS || '3', 10);
  }

  /**
   * Execute a function with circuit breaker protection
   */
  async execute<T>(
    circuitName: string,
    operation: () => Promise<T>,
    fallback?: () => Promise<T>,
  ): Promise<T> {
    const circuit = this.getOrCreateCircuit(circuitName);

    // Check if circuit allows execution
    if (!circuit.canAttempt()) {
      this.logger.warn(`Circuit ${circuitName} is OPEN, using fallback`, 'CircuitBreakerService');
      if (fallback) {
        return fallback();
      }
      throw new Error(`Circuit ${circuitName} is OPEN`);
    }

    try {
      const result = await operation();
      this.recordSuccess(circuitName);
      return result;
    } catch (error) {
      this.recordFailure(circuitName);
      if (fallback) {
        this.logger.warn(`Operation failed for ${circuitName}, using fallback`, 'CircuitBreakerService');
        return fallback();
      }
      throw error;
    }
  }

  /**
   * Get current circuit state
   */
  getCircuitState(circuitName: string): CircuitStateVO {
    return this.getOrCreateCircuit(circuitName);
  }

  /**
   * Get all circuit states
   */
  getAllCircuitStates(): Record<string, CircuitStateVO> {
    const states: Record<string, CircuitStateVO> = {};
    this.circuits.forEach((state, name) => {
      states[name] = state;
    });
    return states;
  }

  private getOrCreateCircuit(circuitName: string): CircuitStateVO {
    if (!this.circuits.has(circuitName)) {
      this.circuits.set(circuitName, CircuitStateVO.closed());
    }
    return this.circuits.get(circuitName)!;
  }

  private recordSuccess(circuitName: string): void {
    const circuit = this.getOrCreateCircuit(circuitName);

    if (circuit.isHalfOpen()) {
      // Success in half-open state, close the circuit
      this.circuits.set(circuitName, CircuitStateVO.closed());
      this.logger.log(`Circuit ${circuitName} recovered, closing circuit`, 'CircuitBreakerService');
    } else if (circuit.isClosed()) {
      // Reset failure count on success
      this.circuits.set(circuitName, CircuitStateVO.closed());
    }
  }

  private recordFailure(circuitName: string): void {
    const circuit = this.getOrCreateCircuit(circuitName);
    const failureCount = circuit.failureCount + 1;

    if (circuit.isHalfOpen()) {
      // Failure in half-open, open the circuit again
      const nextAttemptTime = new Date(Date.now() + this.timeoutMs);
      this.circuits.set(
        circuitName,
        CircuitStateVO.open(failureCount, new Date(), nextAttemptTime),
      );
      this.logger.warn(`Circuit ${circuitName} failed in half-open, opening again`, 'CircuitBreakerService');
    } else if (failureCount >= this.failureThreshold) {
      // Too many failures, open the circuit
      const nextAttemptTime = new Date(Date.now() + this.timeoutMs);
      this.circuits.set(
        circuitName,
        CircuitStateVO.open(failureCount, new Date(), nextAttemptTime),
      );
      this.logger.warn(`Circuit ${circuitName} opened after ${failureCount} failures`, 'CircuitBreakerService');
    } else {
      // Increment failure count but keep circuit closed
      this.circuits.set(circuitName, CircuitStateVO.closed());
    }

    // Check if we should transition to half-open
    if (circuit.isOpen() && circuit.nextAttemptTime && new Date() >= circuit.nextAttemptTime) {
      this.circuits.set(circuitName, CircuitStateVO.halfOpen());
      this.logger.log(`Circuit ${circuitName} transitioning to half-open`, 'CircuitBreakerService');
    }
  }
}

