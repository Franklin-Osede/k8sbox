import { DeploymentEntity } from '../../src/domain/entities/deployment-entity';
import { DeploymentConfigVO, EnvironmentType } from '../../src/domain/value-objects/deployment-config.vo';
import { SyncStatusVO } from '../../src/domain/value-objects/sync-status.vo';

describe('DeploymentEntity', () => {
  describe('create', () => {
    it('should create a valid deployment entity', () => {
      const config = DeploymentConfigVO.create(
        EnvironmentType.DEV,
        'https://github.com/user/repo',
        'apps/my-app',
        'default',
      );
      const deployment = DeploymentEntity.create('my-app', config);

      expect(deployment.name).toBe('my-app');
      expect(deployment.config).toBe(config);
      expect(deployment.status.isSynced()).toBe(false);
    });

    it('should throw error for empty name', () => {
      const config = DeploymentConfigVO.create(
        EnvironmentType.DEV,
        'https://github.com/user/repo',
        'apps/my-app',
        'default',
      );
      expect(() => {
        DeploymentEntity.create('', config);
      }).toThrow('Deployment name cannot be empty');
    });
  });

  describe('updateStatus', () => {
    it('should update deployment status', () => {
      const config = DeploymentConfigVO.create(
        EnvironmentType.DEV,
        'https://github.com/user/repo',
        'apps/my-app',
        'default',
      );
      const deployment = DeploymentEntity.create('my-app', config);
      const newStatus = SyncStatusVO.synced('abc123');
      const updated = deployment.updateStatus(newStatus);

      expect(updated.status).toBe(newStatus);
      expect(updated.isSynced()).toBe(true);
    });
  });

  describe('updateHealth', () => {
    it('should update deployment health', () => {
      const config = DeploymentConfigVO.create(
        EnvironmentType.DEV,
        'https://github.com/user/repo',
        'apps/my-app',
        'default',
      );
      const deployment = DeploymentEntity.create('my-app', config);
      const updated = deployment.updateHealth({ status: 'Healthy' });

      expect(updated.health?.status).toBe('Healthy');
      expect(updated.isHealthy()).toBe(true);
    });
  });

  describe('needsSync', () => {
    it('should return true when out of sync', () => {
      const config = DeploymentConfigVO.create(
        EnvironmentType.DEV,
        'https://github.com/user/repo',
        'apps/my-app',
        'default',
      );
      const deployment = DeploymentEntity.create('my-app', config);
      const outOfSyncStatus = SyncStatusVO.outOfSync();
      const updated = deployment.updateStatus(outOfSyncStatus);

      expect(updated.needsSync()).toBe(true);
    });
  });
});

