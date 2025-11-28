import { CustomResourceEntity } from '../../src/domain/entities/custom-resource-entity';
import { ResourceSpecVO } from '../../src/domain/value-objects/resource-spec.vo';
import { ResourceStatusVO } from '../../src/domain/value-objects/resource-status.vo';

describe('CustomResourceEntity', () => {
  describe('create', () => {
    it('should create a valid custom resource', () => {
      const spec = ResourceSpecVO.create(3, 'nginx:latest', 80);
      const resource = CustomResourceEntity.create('my-app', 'default', spec);

      expect(resource.name).toBe('my-app');
      expect(resource.namespace).toBe('default');
      expect(resource.spec).toBe(spec);
      expect(resource.status.isPending()).toBe(true);
      expect(resource.generation).toBe(1);
    });

    it('should throw error for empty name', () => {
      const spec = ResourceSpecVO.create(3, 'nginx:latest', 80);
      expect(() => {
        CustomResourceEntity.create('', 'default', spec);
      }).toThrow('Resource name cannot be empty');
    });

    it('should throw error for empty namespace', () => {
      const spec = ResourceSpecVO.create(3, 'nginx:latest', 80);
      expect(() => {
        CustomResourceEntity.create('my-app', '', spec);
      }).toThrow('Namespace cannot be empty');
    });
  });

  describe('updateStatus', () => {
    it('should update resource status', () => {
      const spec = ResourceSpecVO.create(3, 'nginx:latest', 80);
      const resource = CustomResourceEntity.create('my-app', 'default', spec);
      const newStatus = ResourceStatusVO.ready('Ready', 1);
      const updated = resource.updateStatus(newStatus);

      expect(updated.status).toBe(newStatus);
      expect(updated.isReady()).toBe(true);
    });
  });

  describe('updateSpec', () => {
    it('should update resource spec and generation', () => {
      const spec1 = ResourceSpecVO.create(3, 'nginx:latest', 80);
      const resource = CustomResourceEntity.create('my-app', 'default', spec1);
      const spec2 = ResourceSpecVO.create(5, 'nginx:latest', 80);
      const updated = resource.updateSpec(spec2, 2);

      expect(updated.spec.replicas).toBe(5);
      expect(updated.generation).toBe(2);
    });
  });

  describe('needsReconciliation', () => {
    it('should return true for pending status', () => {
      const spec = ResourceSpecVO.create(3, 'nginx:latest', 80);
      const resource = CustomResourceEntity.create('my-app', 'default', spec);

      expect(resource.needsReconciliation()).toBe(true);
    });

    it('should return true when observed generation is less than current', () => {
      const spec = ResourceSpecVO.create(3, 'nginx:latest', 80);
      const resource = CustomResourceEntity.create('my-app', 'default', spec, 2);
      const status = ResourceStatusVO.ready('Ready', 1);
      const updated = resource.updateStatus(status);

      expect(updated.needsReconciliation()).toBe(true);
    });

    it('should return false when resource is ready and generations match', () => {
      const spec = ResourceSpecVO.create(3, 'nginx:latest', 80);
      const resource = CustomResourceEntity.create('my-app', 'default', spec, 1);
      const status = ResourceStatusVO.ready('Ready', 1);
      const updated = resource.updateStatus(status);

      expect(updated.needsReconciliation()).toBe(false);
    });
  });
});

