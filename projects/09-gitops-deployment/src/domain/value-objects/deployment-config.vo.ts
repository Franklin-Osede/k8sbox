/**
 * Value Object: DeploymentConfig
 * Represents deployment configuration for GitOps
 */
export enum EnvironmentType {
  DEV = 'dev',
  STAGING = 'staging',
  PROD = 'prod',
}

export class DeploymentConfigVO {
  constructor(
    public readonly environment: EnvironmentType,
    public readonly gitRepo: string,
    public readonly gitPath: string,
    public readonly targetRevision: string = 'HEAD',
    public readonly namespace: string,
    public readonly syncPolicy?: {
      automated?: boolean;
      prune?: boolean;
      selfHeal?: boolean;
    },
  ) {
    if (!gitRepo || gitRepo.trim().length === 0) {
      throw new Error('Git repository URL is required');
    }
    if (!gitPath || gitPath.trim().length === 0) {
      throw new Error('Git path is required');
    }
    if (!namespace || namespace.trim().length === 0) {
      throw new Error('Namespace is required');
    }
  }

  static create(
    environment: EnvironmentType,
    gitRepo: string,
    gitPath: string,
    namespace: string,
    targetRevision: string = 'HEAD',
    syncPolicy?: {
      automated?: boolean;
      prune?: boolean;
      selfHeal?: boolean;
    },
  ): DeploymentConfigVO {
    return new DeploymentConfigVO(environment, gitRepo, gitPath, targetRevision, namespace, syncPolicy);
  }

  static dev(gitRepo: string, gitPath: string, namespace: string): DeploymentConfigVO {
    return new DeploymentConfigVO(
      EnvironmentType.DEV,
      gitRepo,
      gitPath,
      'HEAD',
      namespace,
      { automated: true, prune: true, selfHeal: true },
    );
  }

  static staging(gitRepo: string, gitPath: string, namespace: string): DeploymentConfigVO {
    return new DeploymentConfigVO(
      EnvironmentType.STAGING,
      gitRepo,
      gitPath,
      'HEAD',
      namespace,
      { automated: false, prune: true, selfHeal: false },
    );
  }

  static prod(gitRepo: string, gitPath: string, namespace: string, targetRevision: string): DeploymentConfigVO {
    return new DeploymentConfigVO(
      EnvironmentType.PROD,
      gitRepo,
      gitPath,
      targetRevision,
      namespace,
      { automated: false, prune: false, selfHeal: false },
    );
  }
}

