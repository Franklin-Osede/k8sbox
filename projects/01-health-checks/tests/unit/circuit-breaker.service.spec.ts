import { Test, TestingModule } from '@nestjs/testing';
import { CircuitBreakerService } from '../../src/infrastructure/external/circuit-breaker.service';
import { AppLoggerService } from '../../src/infrastructure/external/logger.service';
import { CircuitState } from '../../src/domain/value-objects/circuit-state.vo';

describe('CircuitBreakerService', () => {
  let service: CircuitBreakerService;
  let logger: AppLoggerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CircuitBreakerService,
        AppLoggerService,
      ],
    }).compile();

    service = module.get<CircuitBreakerService>(CircuitBreakerService);
    logger = module.get<AppLoggerService>(AppLoggerService);
  });

  describe('execute', () => {
    it('should execute operation when circuit is closed', async () => {
      const result = await service.execute('test-circuit', async () => 'success');
      
      expect(result).toBe('success');
    });

    it('should use fallback when operation fails', async () => {
      // Test fallback functionality - doesn't need circuit to be open
      const result = await service.execute(
        'test-circuit-fallback',
        async () => {
          throw new Error('Operation failed');
        },
        async () => 'fallback-success',
      );

      expect(result).toBe('fallback-success');
    });

    it('should throw error when operation fails and no fallback', async () => {
      // Test error throwing when no fallback provided
      await expect(
        service.execute('test-circuit-no-fallback', async () => {
          throw new Error('Operation failed');
        }),
      ).rejects.toThrow('Operation failed');
    });
  });

  describe('getCircuitState', () => {
    it('should return circuit state', () => {
      const state = service.getCircuitState('test-circuit');
      
      expect(state).toBeDefined();
      expect(state.isClosed()).toBe(true);
    });
  });

  describe('getAllCircuitStates', () => {
    it('should return all circuit states', () => {
      // Create a circuit
      service.getCircuitState('circuit1');
      
      const states = service.getAllCircuitStates();
      
      expect(states).toBeDefined();
      expect(states['circuit1']).toBeDefined();
    });
  });
});

