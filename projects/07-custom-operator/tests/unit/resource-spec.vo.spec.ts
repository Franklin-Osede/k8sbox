import { ResourceSpecVO } from '../../src/domain/value-objects/resource-spec.vo';

describe('ResourceSpecVO', () => {
  describe('create', () => {
    it('should create a valid resource spec', () => {
      const spec = ResourceSpecVO.create(3, 'nginx:latest', 80, { ENV: 'prod' });

      expect(spec.replicas).toBe(3);
      expect(spec.image).toBe('nginx:latest');
      expect(spec.port).toBe(80);
      expect(spec.env).toEqual({ ENV: 'prod' });
    });

    it('should throw error for negative replicas', () => {
      expect(() => {
        ResourceSpecVO.create(-1, 'nginx:latest', 80);
      }).toThrow('Replicas cannot be negative');
    });

    it('should throw error for empty image', () => {
      expect(() => {
        ResourceSpecVO.create(1, '', 80);
      }).toThrow('Image cannot be empty');
    });

    it('should throw error for invalid port', () => {
      expect(() => {
        ResourceSpecVO.create(1, 'nginx:latest', 0);
      }).toThrow('Port must be between 1 and 65535');

      expect(() => {
        ResourceSpecVO.create(1, 'nginx:latest', 65536);
      }).toThrow('Port must be between 1 and 65535');
    });
  });

  describe('equals', () => {
    it('should return true for equal specs', () => {
      const spec1 = ResourceSpecVO.create(3, 'nginx:latest', 80);
      const spec2 = ResourceSpecVO.create(3, 'nginx:latest', 80);

      expect(spec1.equals(spec2)).toBe(true);
    });

    it('should return false for different specs', () => {
      const spec1 = ResourceSpecVO.create(3, 'nginx:latest', 80);
      const spec2 = ResourceSpecVO.create(2, 'nginx:latest', 80);

      expect(spec1.equals(spec2)).toBe(false);
    });
  });
});

