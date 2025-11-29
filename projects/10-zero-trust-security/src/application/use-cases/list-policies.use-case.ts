import { Injectable } from '@nestjs/common';
import { NetworkPolicyEntity } from '../../domain/entities/network-policy-entity';
import { KubernetesNetworkPolicyService } from '../../infrastructure/external/kubernetes-networkpolicy.service';

/**
 * Use Case: ListPoliciesUseCase
 * Application layer use case for listing network policies
 */
@Injectable()
export class ListPoliciesUseCase {
  constructor(private readonly networkPolicyService: KubernetesNetworkPolicyService) {}

  async execute(namespace?: string): Promise<NetworkPolicyEntity[]> {
    return this.networkPolicyService.listNetworkPolicies(namespace);
  }
}

