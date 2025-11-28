import { PDBEntity } from '../../src/domain/entities/pdb-entity';
import { AvailabilityLevelVO } from '../../src/domain/value-objects/availability-level.vo';
import { PDBStatusVO } from '../../src/domain/value-objects/pdb-status.vo';

describe('PDBEntity', () => {
  const selector = { app: 'test-app' };
  const availabilityLevel = AvailabilityLevelVO.minAvailable(3);

  describe('create', () => {
    it('should create a valid PDB entity', () => {
      const pdb = PDBEntity.create('test-pdb', 'default', availabilityLevel, selector);

      expect(pdb.name).toBe('test-pdb');
      expect(pdb.namespace).toBe('default');
      expect(pdb.availabilityLevel).toBe(availabilityLevel);
      expect(pdb.selector).toEqual(selector);
    });

    it('should throw error for empty name', () => {
      expect(() => {
        PDBEntity.create('', 'default', availabilityLevel, selector);
      }).toThrow('PDB name cannot be empty');
    });

    it('should throw error for empty namespace', () => {
      expect(() => {
        PDBEntity.create('test-pdb', '', availabilityLevel, selector);
      }).toThrow('PDB namespace cannot be empty');
    });

    it('should throw error for empty selector', () => {
      expect(() => {
        PDBEntity.create('test-pdb', 'default', availabilityLevel, {});
      }).toThrow('PDB selector cannot be empty');
    });
  });

  describe('updateStatus', () => {
    it('should update PDB status', () => {
      const pdb = PDBEntity.create('test-pdb', 'default', availabilityLevel, selector);
      const status = PDBStatusVO.healthy(5, 5, 2);
      const updated = pdb.updateStatus(status);

      expect(updated.status).toBe(status);
      expect(updated.isHealthy()).toBe(true);
    });
  });

  describe('isHealthy', () => {
    it('should return true when status is healthy', () => {
      const pdb = PDBEntity.create('test-pdb', 'default', availabilityLevel, selector);
      const status = PDBStatusVO.healthy(5, 5, 2);
      const updated = pdb.updateStatus(status);

      expect(updated.isHealthy()).toBe(true);
    });

    it('should return false when status is violated', () => {
      const pdb = PDBEntity.create('test-pdb', 'default', availabilityLevel, selector);
      const status = PDBStatusVO.violated(3, 5, 2, 1);
      const updated = pdb.updateStatus(status);

      expect(updated.isHealthy()).toBe(false);
    });

    it('should return false when status is undefined', () => {
      const pdb = PDBEntity.create('test-pdb', 'default', availabilityLevel, selector);

      expect(pdb.isHealthy()).toBe(false);
    });
  });

  describe('getAvailabilityPercentage', () => {
    it('should return availability percentage', () => {
      const pdb = PDBEntity.create('test-pdb', 'default', availabilityLevel, selector);
      const status = PDBStatusVO.healthy(4, 5, 1);
      const updated = pdb.updateStatus(status);

      expect(updated.getAvailabilityPercentage()).toBe(80);
    });
  });
});

