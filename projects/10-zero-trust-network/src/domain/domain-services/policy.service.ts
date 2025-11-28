import { Injectable } from '@nestjs/common';
import { NetworkPolicyEntity } from '../entities/network-policy-entity';
import { NetworkRuleVO } from '../value-objects/network-rule.vo';
import { KubernetesNetworkPolicyService } from '../../infrastructure/external/kubernetes-networkpolicy.service';
import { AppLoggerService } from '../../infrastructure/external/logger.service';

/**
 * Domain Service: PolicyDomainService
 * Core business logic for network security policies
 */
@Injectable()
export class PolicyDomainService {
  constructor(
    private readonly networkPolicyService: KubernetesNetworkPolicyService,
    private readonly logger: AppLoggerService,
  ) {}

  /**
   * Apply network policy
   */
  async applyPolicy(policy: NetworkPolicyEntity): Promise<void> {
    try {
      this.logger.log(
        `Applying NetworkPolicy ${policy.name} in namespace ${policy.namespace}`,
        'PolicyDomainService',
      );

      // Validate policy
      const validation = this.validatePolicy(policy);
      if (!validation.valid) {
        throw new Error(`Invalid policy: ${validation.errors.join(', ')}`);
      }

      // Check if policy exists
      const existing = await this.networkPolicyService.getNetworkPolicy(
        policy.name,
        policy.namespace,
      );

      if (existing) {
        // Update existing policy (delete and recreate for simplicity)
        await this.networkPolicyService.deleteNetworkPolicy(policy.name, policy.namespace);
      }

      // Create policy
      await this.networkPolicyService.createNetworkPolicy(policy);

      this.logger.log(
        `Successfully applied NetworkPolicy ${policy.name}`,
        'PolicyDomainService',
      );
    } catch (error) {
      this.logger.error(
        `Failed to apply policy ${policy.name}: ${error.message}`,
        error.stack,
        'PolicyDomainService',
      );
      throw error;
    }
  }

  /**
   * Create default deny-all policy
   */
  async createDenyAllPolicy(name: string, namespace: string, podSelector: Record<string, string>): Promise<void> {
    const denyIngress = NetworkRuleVO.denyAllIngress();
    const denyEgress = NetworkRuleVO.denyAllEgress();
    const policy = NetworkPolicyEntity.create(name, namespace, podSelector, [denyIngress, denyEgress]);

    await this.applyPolicy(policy);
  }

  /**
   * Validate policy configuration
   */
  validatePolicy(policy: NetworkPolicyEntity): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!policy.name || policy.name.trim().length === 0) {
      errors.push('Policy name is required');
    }

    if (!policy.namespace || policy.namespace.trim().length === 0) {
      errors.push('Namespace is required');
    }

    if (!policy.podSelector || Object.keys(policy.podSelector).length === 0) {
      errors.push('Pod selector is required');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

