import { MetricValueVO } from '../value-objects/metric-value.vo';

/**
 * Domain Entity: MetricEntity
 * Represents a business metric
 */
export class MetricEntity {
  constructor(
    public readonly name: string,
    public readonly value: MetricValueVO,
    public readonly description: string,
  ) {
    if (!name || name.trim().length === 0) {
      throw new Error('Metric name cannot be empty');
    }
  }

  static create(
    name: string,
    value: number,
    description: string = '',
    labels?: Record<string, string>,
  ): MetricEntity {
    return new MetricEntity(name, MetricValueVO.create(value, labels), description);
  }

  updateValue(value: number, labels?: Record<string, string>): MetricEntity {
    return new MetricEntity(
      this.name,
      MetricValueVO.create(value, labels),
      this.description,
    );
  }

  getValue(): number {
    return this.value.value;
  }

  getLabels(): Record<string, string> | undefined {
    return this.value.labels;
  }
}

