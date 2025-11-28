import { SyncStatusVO } from '../value-objects/sync-status.vo';
import { DeploymentConfigVO } from '../value-objects/deployment-config.vo';

/**
 * Domain Entity: DeploymentEntity
 * Represents a GitOps deployment application
 */
export class DeploymentEntity {
  constructor(
    public readonly name: string,
    public readonly config: DeploymentConfigVO,
    public readonly status: SyncStatusVO,
    public readonly health?: {
      status: string;
      message?: string;
    },
  ) {
    if (!name || name.trim().length === 0) {
      throw new Error('Deployment name cannot be empty');
    }
  }

  static create(
    name: string,
    config: DeploymentConfigVO,
    status: SyncStatusVO = SyncStatusVO.unknown(),
  ): DeploymentEntity {
    return new DeploymentEntity(name, config, status);
  }

  updateStatus(status: SyncStatusVO): DeploymentEntity {
    return new DeploymentEntity(this.name, this.config, status, this.health);
  }

  updateHealth(health: { status: string; message?: string }): DeploymentEntity {
    return new DeploymentEntity(this.name, this.config, this.status, health);
  }

  updateConfig(config: DeploymentConfigVO): DeploymentEntity {
    return new DeploymentEntity(this.name, config, this.status, this.health);
  }

  isHealthy(): boolean {
    return this.health?.status === 'Healthy';
  }

  isSynced(): boolean {
    return this.status.isSynced();
  }

  needsSync(): boolean {
    return this.status.isOutOfSync();
  }
}

