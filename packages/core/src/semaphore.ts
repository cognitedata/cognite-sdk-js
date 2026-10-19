// Copyright 2026 Cognite AS

export class Semaphore {
  private active = 0;
  private readonly waiters: (() => void)[] = [];

  constructor(private readonly max: number) {}

  public acquire(): Promise<() => void> {
    return new Promise((resolve) => {
      if (this.active < this.max) {
        this.active++;
        resolve(this.createRelease());
      } else {
        this.waiters.push(() => resolve(this.createRelease()));
      }
    });
  }

  public async run<T>(fn: () => Promise<T>): Promise<T> {
    const release = await this.acquire();
    try {
      return await fn();
    } finally {
      release();
    }
  }

  private createRelease(): () => void {
    let released = false;
    return () => {
      if (released) return;
      released = true;
      const next = this.waiters.shift();
      if (next) {
        // Transfer the occupied slot directly to the oldest waiter.
        next();
      } else {
        this.active--;
      }
    };
  }
}
