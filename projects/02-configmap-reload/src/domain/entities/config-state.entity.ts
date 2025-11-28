/**
 * Domain Entity: ConfigState
 * Represents the current configuration state
 */
export class ConfigStateEntity {
  private config: Map<string, string> = new Map();
  private lastReload: Date | null = null;
  private reloadCount: number = 0;

  constructor(initialConfig?: Record<string, string>) {
    if (initialConfig) {
      Object.entries(initialConfig).forEach(([key, value]) => {
        this.config.set(key, value);
      });
      this.lastReload = new Date();
    }
  }

  get(key: string): string | undefined {
    return this.config.get(key);
  }

  getAll(): Record<string, string> {
    const result: Record<string, string> = {};
    this.config.forEach((value, key) => {
      result[key] = value;
    });
    return result;
  }

  set(key: string, value: string): void {
    this.config.set(key, value);
  }

  update(newConfig: Record<string, string>): void {
    Object.entries(newConfig).forEach(([key, value]) => {
      this.config.set(key, value);
    });
    this.lastReload = new Date();
    this.reloadCount++;
  }

  getLastReload(): Date | null {
    return this.lastReload;
  }

  getReloadCount(): number {
    return this.reloadCount;
  }

  getSize(): number {
    return this.config.size;
  }
}

