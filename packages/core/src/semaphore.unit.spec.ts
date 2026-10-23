// Copyright 2026 Cognite AS

import { describe, expect, test, vi } from 'vitest';
import { deferred, flushRequests } from './__tests__/concurrencyTestUtils';
import { Semaphore } from './semaphore';

describe('Semaphore', () => {
  test('respects the limit and transfers slots in FIFO order', async () => {
    const semaphore = new Semaphore(2);
    const releaseFirst = await semaphore.acquire();
    const releaseSecond = await semaphore.acquire();
    const third = vi.fn();
    const fourth = vi.fn();
    const thirdSlot = semaphore.acquire().then((release) => {
      third();
      return release;
    });
    await flushRequests();
    expect(third).not.toHaveBeenCalled();
    releaseFirst();
    const fourthSlot = semaphore.acquire().then((release) => {
      fourth();
      return release;
    });
    const releaseThird = await thirdSlot;
    expect(third).toHaveBeenCalledOnce();
    expect(fourth).not.toHaveBeenCalled();
    releaseFirst();
    await flushRequests();
    expect(fourth).not.toHaveBeenCalled();
    releaseSecond();
    const releaseFourth = await fourthSlot;
    releaseThird();
    releaseFourth();
  });

  test('releases after a synchronous throw or asynchronous rejection', async () => {
    const semaphore = new Semaphore(1);
    await expect(
      semaphore.run(() => {
        throw new Error('sync failure');
      })
    ).rejects.toThrow('sync failure');
    const pending = deferred<void>();
    const failed = semaphore.run(() => pending.promise);
    const next = vi.fn(async () => 42);
    const queued = semaphore.run(next);
    const rejection = expect(failed).rejects.toThrow('async failure');
    await flushRequests();
    expect(next).not.toHaveBeenCalled();
    pending.reject(new Error('async failure'));
    await rejection;
    await expect(queued).resolves.toBe(42);
  });

  test('Infinity admits all work without waiting', async () => {
    const semaphore = new Semaphore(Number.POSITIVE_INFINITY);
    const gate = deferred<void>();
    const work = vi.fn(() => gate.promise);
    const results = Array.from({ length: 100 }, () => semaphore.run(work));
    await flushRequests();
    expect(work).toHaveBeenCalledTimes(100);
    gate.resolve();
    await Promise.all(results);
  });
});
