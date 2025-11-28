/**
 * Value Object: SnapshotInfo
 * Represents volume snapshot information
 */
export class SnapshotInfoVO {
  constructor(
    public readonly name: string,
    public readonly volumeSnapshotName: string,
    public readonly pvcName: string,
    public readonly size: number,
    public readonly createdAt: Date,
    public readonly readyToUse: boolean,
  ) {
    if (!name || name.trim().length === 0) {
      throw new Error('Snapshot name cannot be empty');
    }
    if (size < 0) {
      throw new Error('Snapshot size cannot be negative');
    }
  }

  static create(
    name: string,
    volumeSnapshotName: string,
    pvcName: string,
    size: number,
    readyToUse: boolean = false,
  ): SnapshotInfoVO {
    return new SnapshotInfoVO(name, volumeSnapshotName, pvcName, size, new Date(), readyToUse);
  }

  markAsReady(): SnapshotInfoVO {
    return new SnapshotInfoVO(
      this.name,
      this.volumeSnapshotName,
      this.pvcName,
      this.size,
      this.createdAt,
      true,
    );
  }
}

