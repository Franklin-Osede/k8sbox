/**
 * Value Object: ResourceSpec
 * Represents the specification of a custom resource
 */
export class ResourceSpecVO {
  constructor(
    public readonly replicas: number,
    public readonly image: string,
    public readonly port: number,
    public readonly env?: Record<string, string>,
  ) {
    if (replicas < 0) {
      throw new Error('Replicas cannot be negative');
    }
    if (!image || image.trim().length === 0) {
      throw new Error('Image cannot be empty');
    }
    if (port < 1 || port > 65535) {
      throw new Error('Port must be between 1 and 65535');
    }
  }

  static create(
    replicas: number,
    image: string,
    port: number,
    env?: Record<string, string>,
  ): ResourceSpecVO {
    return new ResourceSpecVO(replicas, image, port, env);
  }

  equals(other: ResourceSpecVO): boolean {
    return (
      this.replicas === other.replicas &&
      this.image === other.image &&
      this.port === other.port &&
      JSON.stringify(this.env) === JSON.stringify(other.env)
    );
  }
}

