/**
 * Value Object: MetricValue
 * Represents a metric value with timestamp
 */
export class MetricValueVO {
  constructor(
    public readonly value: number,
    public readonly timestamp: Date,
    public readonly labels?: Record<string, string>,
  ) {
    if (isNaN(value)) {
      throw new Error('Metric value must be a valid number');
    }
    if (value < 0) {
      throw new Error('Metric value cannot be negative');
    }
  }

  static create(value: number, labels?: Record<string, string>): MetricValueVO {
    return new MetricValueVO(value, new Date(), labels);
  }

  equals(other: MetricValueVO): boolean {
    return (
      this.value === other.value &&
      this.timestamp.getTime() === other.timestamp.getTime()
    );
  }
}


