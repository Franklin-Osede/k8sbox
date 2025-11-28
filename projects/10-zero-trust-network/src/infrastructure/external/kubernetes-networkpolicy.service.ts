import { Injectable } from '@nestjs/common';
import * as k8s from '@kubernetes/client-node';
import { AppLoggerService } from './logger.service';
import { NetworkPolicyEntity } from '../../domain/entities/network-policy-entity';
import { NetworkRuleVO, RuleDirection } from '../../domain/value-objects/network-rule.vo';

/**
 * Infrastructure Service: KubernetesNetworkPolicyService
 * Interacts with Kubernetes API for NetworkPolicy resources
 */
@Injectable()
export class KubernetesNetworkPolicyService {
  private k8sNetworkingApi: k8s.NetworkingV1Api;

  constructor(private readonly logger: AppLoggerService) {
    const kc = new k8s.KubeConfig();
    kc.loadFromDefault();

    this.k8sNetworkingApi = kc.makeApiClient(k8s.NetworkingV1Api);

    this.logger.log('Kubernetes NetworkPolicy service initialized', 'KubernetesNetworkPolicyService');
  }

  /**
   * Create NetworkPolicy
   */
  async createNetworkPolicy(policy: NetworkPolicyEntity): Promise<void> {
    try {
      const networkPolicy = this.buildNetworkPolicy(policy);

      await this.k8sNetworkingApi.createNamespacedNetworkPolicy(
        policy.namespace,
        networkPolicy,
      );

      this.logger.log(`Created NetworkPolicy ${policy.name}`, 'KubernetesNetworkPolicyService');
    } catch (error) {
      this.logger.error(
        `Failed to create NetworkPolicy ${policy.name}: ${error.message}`,
        error.stack,
        'KubernetesNetworkPolicyService',
      );
      throw error;
    }
  }

  /**
   * Get NetworkPolicy
   */
  async getNetworkPolicy(name: string, namespace: string): Promise<NetworkPolicyEntity | null> {
    try {
      const response = await this.k8sNetworkingApi.readNamespacedNetworkPolicy(name, namespace);
      return this.mapToEntity(response.body);
    } catch (error) {
      if (error.response?.statusCode === 404) {
        return null;
      }
      this.logger.error(
        `Failed to get NetworkPolicy ${name}: ${error.message}`,
        error.stack,
        'KubernetesNetworkPolicyService',
      );
      throw error;
    }
  }

  /**
   * List NetworkPolicies
   */
  async listNetworkPolicies(namespace?: string): Promise<NetworkPolicyEntity[]> {
    try {
      const response = await this.k8sNetworkingApi.listNamespacedNetworkPolicy(namespace || 'default');
      const policies: NetworkPolicyEntity[] = [];
      for (const item of response.body.items || []) {
        policies.push(this.mapToEntity(item));
      }
      return policies;
    } catch (error) {
      this.logger.error(
        `Failed to list NetworkPolicies: ${error.message}`,
        error.stack,
        'KubernetesNetworkPolicyService',
      );
      throw error;
    }
  }

  /**
   * Delete NetworkPolicy
   */
  async deleteNetworkPolicy(name: string, namespace: string): Promise<void> {
    try {
      await this.k8sNetworkingApi.deleteNamespacedNetworkPolicy(name, namespace);
      this.logger.log(`Deleted NetworkPolicy ${name}`, 'KubernetesNetworkPolicyService');
    } catch (error) {
      if (error.response?.statusCode === 404) {
        return;
      }
      this.logger.error(
        `Failed to delete NetworkPolicy ${name}: ${error.message}`,
        error.stack,
        'KubernetesNetworkPolicyService',
      );
      throw error;
    }
  }

  /**
   * Build NetworkPolicy manifest from entity
   */
  private buildNetworkPolicy(policy: NetworkPolicyEntity): k8s.V1NetworkPolicy {
    const ingress: k8s.V1NetworkPolicyIngressRule[] = [];
    const egress: k8s.V1NetworkPolicyEgressRule[] = [];

    for (const rule of policy.rules) {
      if (rule.direction === RuleDirection.INGRESS && rule.action === 'Allow' && rule.from) {
        ingress.push({
          from: rule.from.map((f) => ({
            podSelector: f.podSelector ? { matchLabels: f.podSelector } : undefined,
            namespaceSelector: f.namespaceSelector ? { matchLabels: f.namespaceSelector } : undefined,
          })),
          ports: rule.ports?.map((p) => ({
            protocol: p.protocol as 'TCP' | 'UDP' | 'SCTP',
            port: p.port ? p.port.toString() : undefined,
          })),
        });
      } else if (rule.direction === RuleDirection.EGRESS && rule.action === 'Allow' && rule.to) {
        egress.push({
          to: rule.to.map((t) => ({
            podSelector: t.podSelector ? { matchLabels: t.podSelector } : undefined,
            namespaceSelector: t.namespaceSelector ? { matchLabels: t.namespaceSelector } : undefined,
          })),
          ports: rule.ports?.map((p) => ({
            protocol: p.protocol as 'TCP' | 'UDP' | 'SCTP',
            port: p.port ? p.port.toString() : undefined,
          })),
        });
      }
    }

    return {
      apiVersion: 'networking.k8s.io/v1',
      kind: 'NetworkPolicy',
      metadata: {
        name: policy.name,
        namespace: policy.namespace,
        labels: {
          'app.kubernetes.io/managed-by': 'zero-trust-network',
        },
      },
      spec: {
        podSelector: {
          matchLabels: policy.podSelector,
        },
        policyTypes: policy.policyTypes,
        ingress: ingress.length > 0 ? ingress : undefined,
        egress: egress.length > 0 ? egress : undefined,
      },
    };
  }

  /**
   * Map Kubernetes NetworkPolicy to domain entity
   */
  private mapToEntity(item: k8s.V1NetworkPolicy): NetworkPolicyEntity {
    const podSelector: Record<string, string> = {};
    if (item.spec?.podSelector?.matchLabels) {
      Object.assign(podSelector, item.spec.podSelector.matchLabels);
    }

    const rules: NetworkRuleVO[] = [];

    // Map ingress rules
    if (item.spec?.ingress) {
      for (const ingressRule of item.spec.ingress) {
        const from = ingressRule.from?.map((f) => ({
          podSelector: f.podSelector?.matchLabels,
          namespaceSelector: f.namespaceSelector?.matchLabels,
        }));
        const ports = ingressRule.ports?.map((p) => ({
          protocol: p.protocol || 'TCP',
          port: p.port ? parseInt(p.port.toString()) : undefined,
        }));
        rules.push(NetworkRuleVO.ingressAllow(from || [], ports));
      }
    }

    // Map egress rules
    if (item.spec?.egress) {
      for (const egressRule of item.spec.egress) {
        const to = egressRule.to?.map((t) => ({
          podSelector: t.podSelector?.matchLabels,
          namespaceSelector: t.namespaceSelector?.matchLabels,
        }));
        const ports = egressRule.ports?.map((p) => ({
          protocol: p.protocol || 'TCP',
          port: p.port ? parseInt(p.port.toString()) : undefined,
        }));
        rules.push(NetworkRuleVO.egressAllow(to || [], ports));
      }
    }

    return NetworkPolicyEntity.create(
      item.metadata?.name || '',
      item.metadata?.namespace || 'default',
      podSelector,
      rules,
      item.spec?.policyTypes as Array<'Ingress' | 'Egress'>,
    );
  }
}

