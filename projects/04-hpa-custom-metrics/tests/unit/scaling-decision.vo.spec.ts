import { ScalingDecisionVO, ScalingAction } from '../../src/domain/value-objects/scaling-decision.vo';

describe('ScalingDecisionVO', () => {
  describe('scaleUp', () => {
    it('should create scale up decision', () => {
      const decision = ScalingDecisionVO.scaleUp(2, 4, 150, 100);

      expect(decision.action).toBe(ScalingAction.SCALE_UP);
      expect(decision.currentReplicas).toBe(2);
      expect(decision.targetReplicas).toBe(4);
      expect(decision.shouldScale()).toBe(true);
    });
  });

  describe('scaleDown', () => {
    it('should create scale down decision', () => {
      const decision = ScalingDecisionVO.scaleDown(4, 2, 50, 100);

      expect(decision.action).toBe(ScalingAction.SCALE_DOWN);
      expect(decision.currentReplicas).toBe(4);
      expect(decision.targetReplicas).toBe(2);
      expect(decision.shouldScale()).toBe(true);
    });
  });

  describe('noAction', () => {
    it('should create no action decision', () => {
      const decision = ScalingDecisionVO.noAction(2, 75, 100);

      expect(decision.action).toBe(ScalingAction.NO_ACTION);
      expect(decision.currentReplicas).toBe(decision.targetReplicas);
      expect(decision.shouldScale()).toBe(false);
    });
  });
});


