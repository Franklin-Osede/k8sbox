/**
 * Value Object: SecretKey
 * Represents a secret key identifier
 */
export class SecretKeyVO {
  constructor(
    public readonly name: string,
    public readonly namespace: string,
  ) {
    if (!name || name.trim().length === 0) {
      throw new Error('Secret name cannot be empty');
    }
    if (!namespace || namespace.trim().length === 0) {
      throw new Error('Secret namespace cannot be empty');
    }
  }

  static create(name: string, namespace: string): SecretKeyVO {
    return new SecretKeyVO(name, namespace);
  }

  equals(other: SecretKeyVO): boolean {
    return this.name === other.name && this.namespace === other.namespace;
  }

  toString(): string {
    return `${this.namespace}/${this.name}`;
  }
}

