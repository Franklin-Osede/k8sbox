import { MetricEntity } from '../../src/domain/entities/metric-entity';

describe('MetricEntity', () => {
  describe('create', () => {
    it('should create a valid metric entity', () => {
      const metric = MetricEntity.create('requests_per_second', 100, 'RPS metric');

      expect(metric.name).toBe('requests_per_second');
      expect(metric.getValue()).toBe(100);
      expect(metric.description).toBe('RPS metric');
    });

    it('should throw error for empty name', () => {
      expect(() => {
        MetricEntity.create('', 100);
      }).toThrow('Metric name cannot be empty');
    });
  });

  describe('updateValue', () => {
    it('should update metric value', () => {
      const metric = MetricEntity.create('requests_per_second', 100);
      const updated = metric.updateValue(150);

      expect(updated.getValue()).toBe(150);
      expect(updated.name).toBe(metric.name);
    });
  });

  describe('getValue', () => {
    it('should return metric value', () => {
      const metric = MetricEntity.create('requests_per_second', 100);

      expect(metric.getValue()).toBe(100);
    });
  });
});


