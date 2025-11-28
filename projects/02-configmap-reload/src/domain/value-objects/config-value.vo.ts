/**
 * Value Object: ConfigValue
 * Immutable configuration value
 */
export class ConfigValue {
  constructor(
    public readonly key: string,
    public readonly value: string,
    public readonly lastModified: Date,
  ) {
    if (!key || key.trim().length === 0) {
      throw new Error('Config key cannot be empty');
    }
  }

  equals(other: ConfigValue): boolean {
    return this.key === other.key && this.value === other.value;
  }

  hasChanged(other: ConfigValue): boolean {
    return !this.equals(other);
  }
}

