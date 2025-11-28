import { Injectable } from '@nestjs/common';
import { NetworkPolicyEntity } from '../../domain/entities/network-policy-entity';
import { PolicyDomainService } from '../../domain/domain-services/policy.service';

/**
 * Use Case: CreatePolicyUseCase
 * Application layer use case for creating network policies
 */
@Injectable()
export class CreatePolicyUseCase {
  constructor(private readonly policyService: PolicyDomainService) {}

  async execute(policy: NetworkPolicyEntity): Promise<void> {
    await this.policyService.applyPolicy(policy);
  }
}

