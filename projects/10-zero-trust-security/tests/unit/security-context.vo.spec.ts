import { SecurityContextVO } from '../../src/domain/value-objects/security-context.vo';

describe('SecurityContextVO', () => {
  describe('restricted', () => {
    it('should create restricted security context', () => {
      const context = SecurityContextVO.restricted();

      expect(context.runAsNonRoot).toBe(true);
      expect(context.runAsUser).toBe(1001);
      expect(context.readOnlyRootFilesystem).toBe(true);
      expect(context.capabilities?.drop).toContain('ALL');
    });
  });

  describe('baseline', () => {
    it('should create baseline security context', () => {
      const context = SecurityContextVO.baseline();

      expect(context.runAsNonRoot).toBe(true);
      expect(context.readOnlyRootFilesystem).toBe(false);
    });
  });

  describe('privileged', () => {
    it('should create privileged security context', () => {
      const context = SecurityContextVO.privileged();

      expect(context.runAsNonRoot).toBe(false);
    });
  });

  describe('create', () => {
    it('should create custom security context', () => {
      const context = SecurityContextVO.create(
        true,
        2000,
        2000,
        false,
        true,
        { drop: ['NET_RAW'] },
      );

      expect(context.runAsNonRoot).toBe(true);
      expect(context.runAsUser).toBe(2000);
      expect(context.capabilities?.drop).toContain('NET_RAW');
    });
  });
});

