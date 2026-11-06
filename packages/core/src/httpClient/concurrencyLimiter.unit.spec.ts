// Copyright 2026 Cognite AS

/// <reference lib="es2024.promise" />

import { setImmediate } from 'node:timers/promises';
import { describe, expect, test } from 'vitest';
import { HttpMethod } from './basicHttpClient';
import {
  ConcurrencyLimiter,
  type ConcurrencyPolicy,
} from './concurrencyLimiter';

type Category = 'fast' | 'slow';

const policy: ConcurrencyPolicy<Category> = {
  name: 'toy',
  defaults: { fast: 2, slow: 1 },
  rules: [
    { method: HttpMethod.Post, pattern: /^\/toy\/slow$/, category: 'slow' },
    { pattern: /^\/toy\/(?:slow|fast)$/, category: 'fast' },
  ],
  fallback: (path) => (path.startsWith('/toy/') ? 'slow' : undefined),
};

describe('ConcurrencyLimiter', () => {
  const limiter = new ConcurrencyLimiter([{ policy }]);

  test('classifies by method, normalized path and fallback; first rule wins', () => {
    expect(limiter.classify(HttpMethod.Post, '/toy/slow')).toBe('slow');
    expect(limiter.classify(HttpMethod.Get, '/toy/slow')).toBe('fast');
    expect(
      limiter.classify(HttpMethod.Get, '/cdf/api/v1/projects/p/toy/fast/')
    ).toBe('fast');
    expect(
      limiter.classify(
        HttpMethod.Post,
        '/gateway/api/20230101/projects/p/toy/slow'
      )
    ).toBe('slow');
    expect(limiter.classify(HttpMethod.Get, '/toy/other')).toBe('slow');
    expect(limiter.classify(HttpMethod.Get, '/other')).toBeUndefined();
    expect(
      limiter.classify(HttpMethod.Get, '/api/v1/projects//toy/fast')
    ).toBeUndefined();
    expect(
      limiter.classify(HttpMethod.Get, '/api/v1/projects-other/p/toy/fast')
    ).toBeUndefined();
  });

  test('limits each category independently and ignores unmatched requests', async () => {
    const gates = [
      Promise.withResolvers<void>(),
      Promise.withResolvers<void>(),
      Promise.withResolvers<void>(),
    ];
    let started = 0;
    const run = (pathname: string, gate: Promise<void>) =>
      limiter.run({ method: HttpMethod.Get, pathname }, async () => {
        started++;
        await gate;
      });
    const results = [
      run('/toy/fast', gates[0].promise),
      run('/toy/fast', gates[1].promise),
      run('/toy/fast', gates[2].promise),
    ];
    await setImmediate();
    expect(started).toBe(2);
    await run('/unrelated', Promise.resolve());
    expect(started).toBe(3);
    gates[0].resolve();
    await setImmediate();
    expect(started).toBe(4);
    gates[1].resolve();
    gates[2].resolve();
    await Promise.all(results);
  });

  test('applies overrides and falls back to the default when undefined', async () => {
    const overridden = new ConcurrencyLimiter([
      { policy, options: { fast: undefined, slow: 2 } },
    ]);
    const gate = Promise.withResolvers<void>();
    const startedBy = { fast: 0, slow: 0 };
    const results = (['fast', 'slow'] as const).flatMap((category) =>
      Array.from({ length: 3 }, () =>
        overridden.run(
          { method: HttpMethod.Post, pathname: `/toy/${category}` },
          async () => {
            startedBy[category]++;
            await gate.promise;
          }
        )
      )
    );
    await setImmediate();
    expect(startedBy).toEqual({ fast: 2, slow: 2 });
    gate.resolve();
    await Promise.all(results);
  });

  const withRules = (rules: ConcurrencyPolicy<string>['rules']) => ({
    ...policy,
    rules,
  });

  test.each<[string, () => unknown, string]>([
    ...[0, -1, 1.5, Number.NaN].map((max): [string, () => unknown, string] => [
      `limit ${max}`,
      () => new ConcurrencyLimiter([{ policy, options: { slow: max } }]),
      'concurrency.toy.slow must be a positive integer or Infinity',
    ]),
    [
      'unknown category in options',
      () => new ConcurrencyLimiter([{ policy, options: { typo: 1 } }]),
      'Unknown concurrency category concurrency.toy.typo',
    ],
    [
      'empty category name',
      () =>
        new ConcurrencyLimiter([
          { policy: { ...policy, defaults: { '': 1 } } },
        ]),
      'concurrency.toy has an empty category name',
    ],
    [
      'rule with unknown category',
      () =>
        new ConcurrencyLimiter([
          {
            policy: withRules([{ pattern: /^\/toy$/, category: 'missing' }]),
          },
        ]),
      'uses unknown category missing',
    ],
    [
      'multiple policies',
      () => new ConcurrencyLimiter([{ policy }, { policy }]),
      'Using multiple concurrency policies is not implemented',
    ],
    ...['g', 'y'].map((flags): [string, () => unknown, string] => [
      `rule pattern with the ${flags} flag`,
      () =>
        new ConcurrencyLimiter([
          {
            policy: withRules([
              { pattern: new RegExp('^/toy$', flags), category: 'fast' },
            ]),
          },
        ]),
      'must not use the g or y flag',
    ]),
  ])('rejects %s', (_, create, message) => {
    expect(create).toThrow(message);
  });
});
