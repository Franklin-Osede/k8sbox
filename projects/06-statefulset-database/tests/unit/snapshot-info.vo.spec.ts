import { SnapshotInfoVO } from '../../src/domain/value-objects/snapshot-info.vo';

describe('SnapshotInfoVO', () => {
  describe('create', () => {
    it('should create a valid snapshot info', () => {
      const snapshot = SnapshotInfoVO.create('snapshot-1', 'vs-1', 'pvc-1', 1024);

      expect(snapshot.name).toBe('snapshot-1');
      expect(snapshot.volumeSnapshotName).toBe('vs-1');
      expect(snapshot.pvcName).toBe('pvc-1');
      expect(snapshot.size).toBe(1024);
      expect(snapshot.createdAt).toBeInstanceOf(Date);
      expect(snapshot.readyToUse).toBe(false);
    });

    it('should throw error for empty name', () => {
      expect(() => {
        SnapshotInfoVO.create('', 'vs-1', 'pvc-1', 1024);
      }).toThrow('Snapshot name cannot be empty');
    });

    it('should throw error for negative size', () => {
      expect(() => {
        SnapshotInfoVO.create('snapshot-1', 'vs-1', 'pvc-1', -1);
      }).toThrow('Snapshot size cannot be negative');
    });
  });

  describe('markAsReady', () => {
    it('should mark snapshot as ready', () => {
      const snapshot = SnapshotInfoVO.create('snapshot-1', 'vs-1', 'pvc-1', 1024);
      const ready = snapshot.markAsReady();

      expect(ready.readyToUse).toBe(true);
      expect(ready.name).toBe(snapshot.name);
    });
  });
});

