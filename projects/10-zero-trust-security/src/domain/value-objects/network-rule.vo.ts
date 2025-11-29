/**
 * Value Object: NetworkRule
 * Represents a network policy rule
 */
export enum RuleDirection {
  INGRESS = 'Ingress',
  EGRESS = 'Egress',
}

export enum RuleAction {
  ALLOW = 'Allow',
  DENY = 'Deny',
}

export class NetworkRuleVO {
  constructor(
    public readonly direction: RuleDirection,
    public readonly action: RuleAction,
    public readonly from?: Array<{
      podSelector?: Record<string, string>;
      namespaceSelector?: Record<string, string>;
    }>,
    public readonly to?: Array<{
      podSelector?: Record<string, string>;
      namespaceSelector?: Record<string, string>;
    }>,
    public readonly ports?: Array<{
      protocol: string;
      port?: number;
    }>,
  ) {
    // Only validate for ALLOW rules, DENY rules don't need from/to
    if (action === RuleAction.ALLOW) {
      if (direction === RuleDirection.INGRESS && !from) {
        throw new Error('Ingress rules require "from" specification');
      }
      if (direction === RuleDirection.EGRESS && !to) {
        throw new Error('Egress rules require "to" specification');
      }
    }
  }

  static ingressAllow(
    from: Array<{ podSelector?: Record<string, string>; namespaceSelector?: Record<string, string> }>,
    ports?: Array<{ protocol: string; port?: number }>,
  ): NetworkRuleVO {
    return new NetworkRuleVO(RuleDirection.INGRESS, RuleAction.ALLOW, from, undefined, ports);
  }

  static egressAllow(
    to: Array<{ podSelector?: Record<string, string>; namespaceSelector?: Record<string, string> }>,
    ports?: Array<{ protocol: string; port?: number }>,
  ): NetworkRuleVO {
    return new NetworkRuleVO(RuleDirection.EGRESS, RuleAction.ALLOW, undefined, to, ports);
  }

  static denyAllIngress(): NetworkRuleVO {
    return new NetworkRuleVO(RuleDirection.INGRESS, RuleAction.DENY);
  }

  static denyAllEgress(): NetworkRuleVO {
    return new NetworkRuleVO(RuleDirection.EGRESS, RuleAction.DENY);
  }
}

