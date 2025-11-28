import { DeploymentConfigVO, EnvironmentType } from '../../src/domain/value-objects/deployment-config.vo';

describe('DeploymentConfigVO', () => {
  describe('create', () => {
    it('should create a valid deployment config', () => {
      const config = DeploymentConfigVO.create(
        EnvironmentType.DEV,
        'https://github.com/user/repo',
        'apps/my-app',
        'default',
      );

      expect(config.environment).toBe(EnvironmentType.DEV);
      expect(config.gitRepo).toBe('https://github.com/user/repo');
      expect(config.gitPath).toBe('apps/my-app');
      expect(config.namespace).toBe('default');
    });

    it('should throw error for empty git repo', () => {
      expect(() => {
        DeploymentConfigVO.create(EnvironmentType.DEV, '', 'apps/my-app', 'default');
      }).toThrow('Git repository URL is required');
    });

    it('should throw error for empty git path', () => {
      expect(() => {
        DeploymentConfigVO.create(EnvironmentType.DEV, 'https://github.com/user/repo', '', 'default');
      }).toThrow('Git path is required');
    });
  });

  describe('dev', () => {
    it('should create dev config with automated sync', () => {
      const config = DeploymentConfigVO.dev('https://github.com/user/repo', 'apps/my-app', 'dev');

      expect(config.environment).toBe(EnvironmentType.DEV);
      expect(config.syncPolicy?.automated).toBe(true);
      expect(config.syncPolicy?.prune).toBe(true);
      expect(config.syncPolicy?.selfHeal).toBe(true);
    });
  });

  describe('staging', () => {
    it('should create staging config with manual sync', () => {
      const config = DeploymentConfigVO.staging('https://github.com/user/repo', 'apps/my-app', 'staging');

      expect(config.environment).toBe(EnvironmentType.STAGING);
      expect(config.syncPolicy?.automated).toBe(false);
    });
  });

  describe('prod', () => {
    it('should create prod config with specific revision', () => {
      const config = DeploymentConfigVO.prod(
        'https://github.com/user/repo',
        'apps/my-app',
        'prod',
        'v1.0.0',
      );

      expect(config.environment).toBe(EnvironmentType.PROD);
      expect(config.targetRevision).toBe('v1.0.0');
      expect(config.syncPolicy?.automated).toBe(false);
    });
  });
});

