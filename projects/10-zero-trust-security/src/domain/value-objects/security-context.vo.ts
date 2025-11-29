/**
 * Value Object: SecurityContext
 * Represents pod security context configuration
 */
export enum PodSecurityStandard {
  PRIVILEGED = 'privileged',
  BASELINE = 'baseline',
  RESTRICTED = 'restricted',
}

export class SecurityContextVO {
  constructor(
    public readonly runAsNonRoot: boolean,
    public readonly runAsUser?: number,
    public readonly fsGroup?: number,
    public readonly allowPrivilegeEscalation: boolean = false,
    public readonly readOnlyRootFilesystem: boolean = false,
    public readonly capabilities?: {
      drop?: string[];
      add?: string[];
    },
  ) {}

  static restricted(): SecurityContextVO {
    return new SecurityContextVO(
      true,
      1001,
      1001,
      false,
      true,
      {
        drop: ['ALL'],
      },
    );
  }

  static baseline(): SecurityContextVO {
    return new SecurityContextVO(
      true,
      undefined,
      undefined,
      false,
      false,
      {
        drop: ['NET_RAW'],
      },
    );
  }

  static privileged(): SecurityContextVO {
    return new SecurityContextVO(false);
  }

  static create(
    runAsNonRoot: boolean,
    runAsUser?: number,
    fsGroup?: number,
    allowPrivilegeEscalation: boolean = false,
    readOnlyRootFilesystem: boolean = false,
    capabilities?: { drop?: string[]; add?: string[] },
  ): SecurityContextVO {
    return new SecurityContextVO(
      runAsNonRoot,
      runAsUser,
      fsGroup,
      allowPrivilegeEscalation,
      readOnlyRootFilesystem,
      capabilities,
    );
  }
}

