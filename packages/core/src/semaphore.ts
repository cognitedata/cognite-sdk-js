// Copyright 2026 Cognite AS

export class Semaphore {
  private active = 0;
  private readonly waiters: (() => void)[] = [];

  /**
   * @param max Maximum number of concurrent holders: a positive integer, or `Infinity` for no limit.
   * @param label Name used in the validation error message.
   */
  constructor(
    private readonly max: number,
    label = 'Semaphore limit'
  ) {
    if (
      max !== Number.POSITIVE_INFINITY &&
      (!Number.isInteger(max) || max <= 0)
    ) {
      throw new Error(`${label} must be a positive integer or Infinity`);
    }
  }

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
