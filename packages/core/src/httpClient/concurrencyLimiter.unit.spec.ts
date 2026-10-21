// Copyright 2026 Cognite AS

import { describe, expect, test } from 'vitest';
import { deferred, flushRequests } from '../__tests__/concurrencyTestUtils';
import { HttpMethod } from './basicHttpClient';
import {
  ConcurrencyLimiter,
  type ConcurrencyPolicy,
  combineConcurrencyLimiters,
} from './concurrencyLimiter';

type Category = 'fast' | 'slow';

const policy: ConcurrencyPolicy<Category> = {
  name: 'toy',
  defaults: { fast: 2, slow: 1 },
  rules: [
    { method: HttpMethod.Post, pattern: /^\/toy\/slow$/, category: 'slow' },
    { pattern: /^\/toy\/(?:slow|fast)$/, category: 'fast' },
  ],
  normalizePath: (path) => path.replace(/^\/proxy/, ''),
  fallback: (path) => (path.startsWith('/toy/') ? 'slow' : undefined),
};

describe('ConcurrencyLimiter', () => {
  const limiter = new ConcurrencyLimiter(policy);

  test('classifies by method, normalized path and fallback; first rule wins', () => {
    expect(limiter.classify(HttpMethod.Post, '/toy/slow')).toBe('slow');
    expect(limiter.classify(HttpMethod.Get, '/toy/slow')).toBe('fast');
    expect(limiter.classify(HttpMethod.Get, '/proxy/toy/fast')).toBe('fast');
    expect(limiter.classify(HttpMethod.Get, '/toy/other')).toBe('slow');
    expect(limiter.classify(HttpMethod.Get, '/other')).toBeUndefined();
  });

  test('limits each category independently and ignores unmatched requests', async () => {
    const gates = [deferred<void>(), deferred<void>(), deferred<void>()];
    let started = 0;
    const run = (path: string, gate: Promise<void>) =>
      limiter.run({ method: HttpMethod.Get, path }, async () => {
        started++;
        await gate;
      });
    const results = [
      run('/toy/fast', gates[0].promise),
      run('/toy/fast', gates[1].promise),
      run('/toy/fast', gates[2].promise),
    ];
    await flushRequests();
    expect(started).toBe(2);
    await run('/unrelated', Promise.resolve());
    expect(started).toBe(3);
    gates[0].resolve();
    await flushRequests();
    expect(started).toBe(4);
    gates[1].resolve();
    gates[2].resolve();
    await Promise.all(results);
  });

  test('uses overrides and rejects invalid values and unknown categories', () => {
    expect(
      () => new ConcurrencyLimiter(policy, { fast: Number.POSITIVE_INFINITY })
    ).not.toThrow();
    expect(
      () => new ConcurrencyLimiter(policy, { fast: undefined })
    ).not.toThrow();
    for (const max of [0, -1, 1.5, Number.NaN]) {
      expect(() => new ConcurrencyLimiter(policy, { slow: max })).toThrow(
        'concurrency.toy.slow must be a positive integer or Infinity'
      );
    }
    expect(() => new ConcurrencyLimiter(policy, { typo: 1 } as never)).toThrow(
      'Unknown concurrency category concurrency.toy.typo'
    );
  });

  test('combined limiters each apply to their own requests', async () => {
    const other = new ConcurrencyLimiter<'only'>({
      name: 'other',
      defaults: { only: 1 },
      rules: [{ pattern: /^\/other$/, category: 'only' }],
    });
    const combined = combineConcurrencyLimiters([limiter, other]);
    const gate = deferred<void>();
    let started = 0;
    const run = (path: string) =>
      combined.run({ method: HttpMethod.Get, path }, async () => {
        started++;
        await gate.promise;
        return path;
      });
    const results = [run('/other'), run('/other'), run('/toy/fast'), run('/x')];
    await flushRequests();
    expect(started).toBe(3);
    gate.resolve();
    await expect(Promise.all(results)).resolves.toEqual([
      '/other',
      '/other',
      '/toy/fast',
      '/x',
    ]);
  });
});
