import { NetworkRuleVO, RuleDirection, RuleAction } from '../../src/domain/value-objects/network-rule.vo';

describe('NetworkRuleVO', () => {
  describe('ingressAllow', () => {
    it('should create ingress allow rule', () => {
      const rule = NetworkRuleVO.ingressAllow([
        { podSelector: { app: 'frontend' } },
      ]);

      expect(rule.direction).toBe(RuleDirection.INGRESS);
      expect(rule.action).toBe(RuleAction.ALLOW);
      expect(rule.from).toBeDefined();
    });

    it('should throw error for ingress without from', () => {
      expect(() => {
        new NetworkRuleVO(RuleDirection.INGRESS, RuleAction.ALLOW);
      }).toThrow('Ingress rules require "from" specification');
    });
  });

  describe('egressAllow', () => {
    it('should create egress allow rule', () => {
      const rule = NetworkRuleVO.egressAllow([
        { podSelector: { app: 'backend' } },
      ]);

      expect(rule.direction).toBe(RuleDirection.EGRESS);
      expect(rule.action).toBe(RuleAction.ALLOW);
      expect(rule.to).toBeDefined();
    });

    it('should throw error for egress without to', () => {
      expect(() => {
        new NetworkRuleVO(RuleDirection.EGRESS, RuleAction.ALLOW);
      }).toThrow('Egress rules require "to" specification');
    });
  });

  describe('denyAllIngress', () => {
    it('should create deny all ingress rule', () => {
      const rule = NetworkRuleVO.denyAllIngress();

      expect(rule.direction).toBe(RuleDirection.INGRESS);
      expect(rule.action).toBe(RuleAction.DENY);
    });
  });
});

