import { SecretRotationEntity } from '../../src/domain/entities/secret-rotation.entity';
import { SecretKeyVO } from '../../src/domain/value-objects/secret-key.vo';
import { RotationStatus } from '../../src/domain/value-objects/rotation-status.vo';

describe('SecretRotationEntity', () => {
  const secretKey = SecretKeyVO.create('my-secret', 'default');

  describe('create', () => {
    it('should create a new rotation entity', () => {
      const rotation = SecretRotationEntity.create(secretKey, 24);

      expect(rotation.secretKey.equals(secretKey)).toBe(true);
      expect(rotation.status.isPending()).toBe(true);
      expect(rotation.rotationCount).toBe(0);
      expect(rotation.lastRotationTime).toBeNull();
      expect(rotation.nextRotationTime).not.toBeNull();
    });
  });

  describe('markAsInProgress', () => {
    it('should mark rotation as in progress', () => {
      const rotation = SecretRotationEntity.create(secretKey);
      const inProgress = rotation.markAsInProgress();

      expect(inProgress.status.isInProgress()).toBe(true);
      expect(inProgress.rotationCount).toBe(rotation.rotationCount);
    });
  });

  describe('markAsSuccess', () => {
    it('should mark rotation as success', () => {
      const rotation = SecretRotationEntity.create(secretKey);
      const success = rotation.markAsSuccess(24);

      expect(success.status.isSuccess()).toBe(true);
      expect(success.rotationCount).toBe(1);
      expect(success.lastRotationTime).not.toBeNull();
      expect(success.nextRotationTime).not.toBeNull();
    });
  });

  describe('markAsFailed', () => {
    it('should mark rotation as failed', () => {
      const rotation = SecretRotationEntity.create(secretKey);
      const failed = rotation.markAsFailed('Error occurred');

      expect(failed.status.isFailed()).toBe(true);
      expect(failed.status.message).toBe('Error occurred');
      expect(failed.rotationCount).toBe(rotation.rotationCount);
    });
  });

  describe('shouldRotate', () => {
    it('should return true when next rotation time has passed', () => {
      const rotation = SecretRotationEntity.create(secretKey, -1); // Negative hours = past
      
      // Manually set nextRotationTime to past
      const pastRotation = new SecretRotationEntity(
        rotation.secretKey,
        rotation.status,
        rotation.rotationCount,
        rotation.lastRotationTime,
        new Date(Date.now() - 1000), // 1 second ago
      );

      expect(pastRotation.shouldRotate()).toBe(true);
    });

    it('should return false when rotation is in progress', () => {
      const rotation = SecretRotationEntity.create(secretKey);
      const inProgress = rotation.markAsInProgress();

      expect(inProgress.shouldRotate()).toBe(false);
    });
  });

  describe('isHealthy', () => {
    it('should return true for pending status', () => {
      const rotation = SecretRotationEntity.create(secretKey);

      expect(rotation.isHealthy()).toBe(true);
    });

    it('should return true for success status', () => {
      const rotation = SecretRotationEntity.create(secretKey);
      const success = rotation.markAsSuccess();

      expect(success.isHealthy()).toBe(true);
    });

    it('should return false for failed status', () => {
      const rotation = SecretRotationEntity.create(secretKey);
      const failed = rotation.markAsFailed('Error');

      expect(failed.isHealthy()).toBe(false);
    });
  });
});

