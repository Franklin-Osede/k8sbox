import { SecretKeyVO } from '../../src/domain/value-objects/secret-key.vo';

describe('SecretKeyVO', () => {
  describe('create', () => {
    it('should create a valid secret key', () => {
      const key = SecretKeyVO.create('my-secret', 'default');

      expect(key.name).toBe('my-secret');
      expect(key.namespace).toBe('default');
    });

    it('should throw error for empty name', () => {
      expect(() => {
        SecretKeyVO.create('', 'default');
      }).toThrow('Secret name cannot be empty');
    });

    it('should throw error for empty namespace', () => {
      expect(() => {
        SecretKeyVO.create('my-secret', '');
      }).toThrow('Secret namespace cannot be empty');
    });
  });

  describe('equals', () => {
    it('should return true for equal keys', () => {
      const key1 = SecretKeyVO.create('my-secret', 'default');
      const key2 = SecretKeyVO.create('my-secret', 'default');

      expect(key1.equals(key2)).toBe(true);
    });

    it('should return false for different keys', () => {
      const key1 = SecretKeyVO.create('my-secret', 'default');
      const key2 = SecretKeyVO.create('other-secret', 'default');

      expect(key1.equals(key2)).toBe(false);
    });
  });

  describe('toString', () => {
    it('should return formatted string', () => {
      const key = SecretKeyVO.create('my-secret', 'default');

      expect(key.toString()).toBe('default/my-secret');
    });
  });
});

