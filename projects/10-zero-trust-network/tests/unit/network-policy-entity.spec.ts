import { NetworkPolicyEntity } from '../../src/domain/entities/network-policy-entity';
import { NetworkRuleVO } from '../../src/domain/value-objects/network-rule.vo';

describe('NetworkPolicyEntity', () => {
  describe('create', () => {
    it('should create a valid network policy', () => {
      const rule = NetworkRuleVO.ingressAllow([{ podSelector: { app: 'frontend' } }]);
      const policy = NetworkPolicyEntity.create('test-policy', 'default', { app: 'backend' }, [rule]);

      expect(policy.name).toBe('test-policy');
      expect(policy.namespace).toBe('default');
      expect(policy.podSelector).toEqual({ app: 'backend' });
      expect(policy.rules.length).toBe(1);
    });

    it('should throw error for empty name', () => {
      const rule = NetworkRuleVO.ingressAllow([{ podSelector: { app: 'frontend' } }]);
      expect(() => {
        NetworkPolicyEntity.create('', 'default', { app: 'backend' }, [rule]);
      }).toThrow('NetworkPolicy name cannot be empty');
    });

    it('should throw error for empty pod selector', () => {
      const rule = NetworkRuleVO.ingressAllow([{ podSelector: { app: 'frontend' } }]);
      expect(() => {
        NetworkPolicyEntity.create('test-policy', 'default', {}, [rule]);
      }).toThrow('Pod selector is required');
    });
  });

  describe('addRule', () => {
    it('should add a rule to policy', () => {
      const rule1 = NetworkRuleVO.ingressAllow([{ podSelector: { app: 'frontend' } }]);
      const policy = NetworkPolicyEntity.create('test-policy', 'default', { app: 'backend' }, [rule1]);
      const rule2 = NetworkRuleVO.egressAllow([{ podSelector: { app: 'database' } }]);
      const updated = policy.addRule(rule2);

      expect(updated.rules.length).toBe(2);
      expect(updated.hasEgressRules()).toBe(true);
    });
  });

  describe('hasIngressRules', () => {
    it('should return true when has ingress rules', () => {
      const rule = NetworkRuleVO.ingressAllow([{ podSelector: { app: 'frontend' } }]);
      const policy = NetworkPolicyEntity.create('test-policy', 'default', { app: 'backend' }, [rule]);

      expect(policy.hasIngressRules()).toBe(true);
    });
  });
});

