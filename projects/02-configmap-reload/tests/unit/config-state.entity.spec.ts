import { ConfigStateEntity } from '../../src/domain/entities/config-state.entity';

describe('ConfigStateEntity', () => {
  describe('constructor', () => {
    it('should create empty config state', () => {
      const state = new ConfigStateEntity();
      
      expect(state.getSize()).toBe(0);
      expect(state.getLastReload()).toBeNull();
      expect(state.getReloadCount()).toBe(0);
    });

    it('should create config state with initial config', () => {
      const initialConfig = { key1: 'value1', key2: 'value2' };
      const state = new ConfigStateEntity(initialConfig);
      
      expect(state.getSize()).toBe(2);
      expect(state.get('key1')).toBe('value1');
      expect(state.get('key2')).toBe('value2');
      expect(state.getLastReload()).not.toBeNull();
    });
  });

  describe('get', () => {
    it('should return value for existing key', () => {
      const state = new ConfigStateEntity({ key1: 'value1' });
      
      expect(state.get('key1')).toBe('value1');
    });

    it('should return undefined for non-existing key', () => {
      const state = new ConfigStateEntity();
      
      expect(state.get('nonexistent')).toBeUndefined();
    });
  });

  describe('getAll', () => {
    it('should return all config as object', () => {
      const config = { key1: 'value1', key2: 'value2' };
      const state = new ConfigStateEntity(config);
      
      expect(state.getAll()).toEqual(config);
    });

    it('should return empty object for empty state', () => {
      const state = new ConfigStateEntity();
      
      expect(state.getAll()).toEqual({});
    });
  });

  describe('set', () => {
    it('should set a new key-value pair', () => {
      const state = new ConfigStateEntity();
      state.set('newKey', 'newValue');
      
      expect(state.get('newKey')).toBe('newValue');
      expect(state.getSize()).toBe(1);
    });
  });

  describe('update', () => {
    it('should update config and increment reload count', () => {
      const state = new ConfigStateEntity({ key1: 'value1' });
      const initialReloadCount = state.getReloadCount();
      
      state.update({ key2: 'value2', key3: 'value3' });
      
      expect(state.get('key1')).toBe('value1');
      expect(state.get('key2')).toBe('value2');
      expect(state.get('key3')).toBe('value3');
      expect(state.getReloadCount()).toBe(initialReloadCount + 1);
      expect(state.getLastReload()).not.toBeNull();
    });

    it('should overwrite existing keys', () => {
      const state = new ConfigStateEntity({ key1: 'oldValue' });
      
      state.update({ key1: 'newValue' });
      
      expect(state.get('key1')).toBe('newValue');
    });
  });

  describe('getReloadCount', () => {
    it('should return 0 for new state', () => {
      const state = new ConfigStateEntity();
      
      expect(state.getReloadCount()).toBe(0);
    });

    it('should increment on each update', () => {
      const state = new ConfigStateEntity();
      
      state.update({ key1: 'value1' });
      expect(state.getReloadCount()).toBe(1);
      
      state.update({ key2: 'value2' });
      expect(state.getReloadCount()).toBe(2);
    });
  });
});

