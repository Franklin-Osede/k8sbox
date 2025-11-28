/**
 * Domain Entity: ConfigVersion
 * Represents a versioned configuration snapshot
 */
export class ConfigVersionEntity {
  constructor(
    public readonly version: number,
    public readonly config: Record<string, string>,
    public readonly timestamp: Date,
    public readonly checksum: string,
  ) {}

  static create(version: number, config: Record<string, string>): ConfigVersionEntity {
    const checksum = this.calculateChecksum(config);
    return new ConfigVersionEntity(version, { ...config }, new Date(), checksum);
  }

  equals(other: ConfigVersionEntity): boolean {
    return this.checksum === other.checksum;
  }

  hasChanged(other: ConfigVersionEntity): boolean {
    return !this.equals(other);
  }

  private static calculateChecksum(config: Record<string, string>): string {
    const content = JSON.stringify(config, Object.keys(config).sort());
    // Simple hash function (in production, use crypto.createHash)
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
  }
}

