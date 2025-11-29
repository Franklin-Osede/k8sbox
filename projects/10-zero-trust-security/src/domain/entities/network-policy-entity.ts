import { NetworkRuleVO } from '../value-objects/network-rule.vo';
import { SecurityContextVO } from '../value-objects/security-context.vo';

/**
 * Domain Entity: NetworkPolicyEntity
 * Represents a Kubernetes Network Policy
 */
export class NetworkPolicyEntity {
  constructor(
    public readonly name: string,
    public readonly namespace: string,
    public readonly podSelector: Record<string, string>,
    public readonly rules: NetworkRuleVO[],
    public readonly policyTypes: Array<'Ingress' | 'Egress'> = ['Ingress', 'Egress'],
  ) {
    if (!name || name.trim().length === 0) {
      throw new Error('NetworkPolicy name cannot be empty');
    }
    if (!namespace || namespace.trim().length === 0) {
      throw new Error('Namespace cannot be empty');
    }
    if (!podSelector || Object.keys(podSelector).length === 0) {
      throw new Error('Pod selector is required');
    }
  }

  static create(
    name: string,
    namespace: string,
    podSelector: Record<string, string>,
    rules: NetworkRuleVO[],
    policyTypes: Array<'Ingress' | 'Egress'> = ['Ingress', 'Egress'],
  ): NetworkPolicyEntity {
    return new NetworkPolicyEntity(name, namespace, podSelector, rules, policyTypes);
  }

  addRule(rule: NetworkRuleVO): NetworkPolicyEntity {
    return new NetworkPolicyEntity(
      this.name,
      this.namespace,
      this.podSelector,
      [...this.rules, rule],
      this.policyTypes,
    );
  }

  updatePodSelector(podSelector: Record<string, string>): NetworkPolicyEntity {
    return new NetworkPolicyEntity(
      this.name,
      this.namespace,
      podSelector,
      this.rules,
      this.policyTypes,
    );
  }

  hasIngressRules(): boolean {
    return this.rules.some((r) => r.direction === 'Ingress');
  }

  hasEgressRules(): boolean {
    return this.rules.some((r) => r.direction === 'Egress');
  }
}

