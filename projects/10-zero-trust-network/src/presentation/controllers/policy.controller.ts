import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  HttpCode,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { CreatePolicyUseCase } from '../../application/use-cases/create-policy.use-case';
import { ListPoliciesUseCase } from '../../application/use-cases/list-policies.use-case';
import { NetworkPolicyEntity } from '../../domain/entities/network-policy-entity';
import { NetworkRuleVO, RuleDirection, RuleAction } from '../../domain/value-objects/network-rule.vo';
import { CreatePolicyDto, PolicyDto, RuleDirectionDto, RuleActionDto } from '../dto/policy.dto';
import { KubernetesNetworkPolicyService } from '../../infrastructure/external/kubernetes-networkpolicy.service';

/**
 * Controller: PolicyController
 * Presentation layer controller for network policy endpoints
 */
@ApiTags('policies')
@Controller('policies')
export class PolicyController {
  constructor(
    private readonly createPolicyUseCase: CreatePolicyUseCase,
    private readonly listPoliciesUseCase: ListPoliciesUseCase,
    private readonly networkPolicyService: KubernetesNetworkPolicyService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a network policy' })
  @ApiResponse({ status: 201, description: 'Policy created successfully', type: PolicyDto })
  async createPolicy(@Body() createPolicyDto: CreatePolicyDto): Promise<PolicyDto> {
    const rules = createPolicyDto.rules.map((r) => {
      const isIngress = r.direction === RuleDirectionDto.INGRESS;
      const isAllow = r.action === RuleActionDto.ALLOW;
      
      if (isIngress && isAllow) {
        return NetworkRuleVO.ingressAllow(r.from || [], r.ports);
      } else if (!isIngress && isAllow) {
        return NetworkRuleVO.egressAllow(r.to || [], r.ports);
      } else if (isIngress && !isAllow) {
        return NetworkRuleVO.denyAllIngress();
      } else {
        return NetworkRuleVO.denyAllEgress();
      }
    });

    const policy = NetworkPolicyEntity.create(
      createPolicyDto.name,
      createPolicyDto.namespace,
      createPolicyDto.podSelector,
      rules,
      createPolicyDto.policyTypes || ['Ingress', 'Egress'],
    );

    await this.createPolicyUseCase.execute(policy);

    return this.mapToDto(policy);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List all network policies' })
  @ApiQuery({ name: 'namespace', required: false, description: 'Namespace filter' })
  @ApiResponse({ status: 200, description: 'List of policies', type: [PolicyDto] })
  async listPolicies(@Query('namespace') namespace?: string): Promise<PolicyDto[]> {
    const policies = await this.listPoliciesUseCase.execute(namespace);
    return policies.map((p) => this.mapToDto(p));
  }

  @Get(':name')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get network policy' })
  @ApiParam({ name: 'name', description: 'Policy name' })
  @ApiQuery({ name: 'namespace', required: false, description: 'Namespace (default: default)' })
  @ApiResponse({ status: 200, description: 'Policy details', type: PolicyDto })
  @ApiResponse({ status: 404, description: 'Policy not found' })
  async getPolicy(
    @Param('name') name: string,
    @Query('namespace') namespace: string = 'default',
  ): Promise<PolicyDto> {
    const policy = await this.networkPolicyService.getNetworkPolicy(name, namespace);
    if (!policy) {
      throw new NotFoundException(`NetworkPolicy ${name} not found in namespace ${namespace}`);
    }
    return this.mapToDto(policy);
  }

  private mapToDto(policy: NetworkPolicyEntity): PolicyDto {
    return {
      name: policy.name,
      namespace: policy.namespace,
      podSelector: policy.podSelector,
      rules: policy.rules.map((r) => ({
        direction: r.direction as unknown as RuleDirectionDto,
        action: r.action as unknown as RuleActionDto,
        from: r.from,
        to: r.to,
        ports: r.ports,
      })),
      policyTypes: policy.policyTypes,
      hasIngressRules: policy.hasIngressRules(),
      hasEgressRules: policy.hasEgressRules(),
    };
  }
}

