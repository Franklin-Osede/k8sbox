import { ConfigValue } from '../../src/domain/value-objects/config-value.vo';

describe('ConfigValue Value Object', () => {
  describe('constructor', () => {
    it('should create a config value', () => {
      const configValue = new ConfigValue('key1', 'value1', new Date());
      
      expect(configValue.key).toBe('key1');
      expect(configValue.value).toBe('value1');
      expect(configValue.lastModified).toBeInstanceOf(Date);
    });

    it('should throw error if key is empty', () => {
      expect(() => {
        new ConfigValue('', 'value1', new Date());
      }).toThrow('Config key cannot be empty');
    });

    it('should throw error if key is whitespace only', () => {
      expect(() => {
        new ConfigValue('   ', 'value1', new Date());
      }).toThrow('Config key cannot be empty');
    });
  });

  describe('equals', () => {
    it('should return true for equal config values', () => {
      const date = new Date();
      const value1 = new ConfigValue('key1', 'value1', date);
      const value2 = new ConfigValue('key1', 'value1', date);
      
      expect(value1.equals(value2)).toBe(true);
    });

    it('should return false for different keys', () => {
      const date = new Date();
      const value1 = new ConfigValue('key1', 'value1', date);
      const value2 = new ConfigValue('key2', 'value1', date);
      
      expect(value1.equals(value2)).toBe(false);
    });

    it('should return false for different values', () => {
      const date = new Date();
      const value1 = new ConfigValue('key1', 'value1', date);
      const value2 = new ConfigValue('key1', 'value2', date);
      
      expect(value1.equals(value2)).toBe(false);
    });
  });

  describe('hasChanged', () => {
    it('should return false when values are equal', () => {
      const date = new Date();
      const value1 = new ConfigValue('key1', 'value1', date);
      const value2 = new ConfigValue('key1', 'value1', date);
      
      expect(value1.hasChanged(value2)).toBe(false);
    });

    it('should return true when values are different', () => {
      const date = new Date();
      const value1 = new ConfigValue('key1', 'value1', date);
      const value2 = new ConfigValue('key1', 'value2', date);
      
      expect(value1.hasChanged(value2)).toBe(true);
    });
  });
});

