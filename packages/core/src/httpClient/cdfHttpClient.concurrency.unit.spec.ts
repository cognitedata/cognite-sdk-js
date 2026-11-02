// Copyright 2026 Cognite AS

/// <reference lib="es2024.promise" />

import { setImmediate } from 'node:timers/promises';
import { Response } from 'cross-fetch';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { controlFetch } from '../__tests__/concurrencyTestUtils';
import { CDFHttpClient } from './cdfHttpClient';
import type { ConcurrencyPolicy } from './concurrencyLimiter';
import { createUniversalRetryValidator } from './retryValidator';

vi.mock('cross-fetch', async (importOriginal) => ({
  ...(await importOriginal<typeof import('cross-fetch')>()),
  default: vi.fn(),
}));

type Category = 'slow';

const policy: ConcurrencyPolicy<Category> = {
  name: 'toy',
  defaults: { slow: 1 },
  rules: [{ pattern: /^\/toy\/slow$/, category: 'slow' }],
};

describe('CDFHttpClient concurrency limiting', () => {
  let requests: ReturnType<typeof controlFetch>;
  const baseUrl = 'https://example.com';
  const query = '/toy/slow';
  const createClient = () => {
    const client = new CDFHttpClient(baseUrl, createUniversalRetryValidator());
    client.setConcurrencyPolicies([{ policy }]);
    return client;
  };

  beforeEach(() => {
    requests = controlFetch();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  test('holds the slot until the entire response body is consumed', async () => {
    const client = createClient();
    const results = [client.post(query), client.post(query)];
    await setImmediate();
    const body = Promise.withResolvers<unknown>();
    const response = new Response();
    vi.spyOn(response, 'json').mockReturnValue(body.promise);
    requests[0].resolve(response);
    await setImmediate();
    expect(requests).toHaveLength(1);
    body.resolve({ items: [] });
    await results[0];
    await setImmediate();
    expect(requests).toHaveLength(2);
    requests[1].reply();
    await Promise.all(results);
  });

  test('releases during 429 backoff and reacquires behind queued requests', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    const client = createClient();
    const first = client.post(query);
    const second = client.post(query);
    await setImmediate();
    requests[0].reply({}, 429);
    await setImmediate();
    expect(requests).toHaveLength(2);
    expect(vi.getTimerCount()).toBe(1);
    await vi.runAllTimersAsync();
    expect(requests).toHaveLength(2);
    requests[1].reply();
    await second;
    await setImmediate();
    expect(requests).toHaveLength(3);
    requests[2].reply();
    await first;
  });

  test.each<{
    name: string;
    finish: (request: ReturnType<typeof controlFetch>[number]) => void;
    error: string;
  }>([
    {
      name: 'transport failure',
      finish: (request) => request.reject(new Error('connection failed')),
      error: 'connection failed',
    },
    {
      name: 'error status',
      finish: (request) => request.reply({}, 400),
      error: 'status code: 400',
    },
  ])(
    'releases the slot after a $name and keeps limiting',
    async ({ finish, error }) => {
      const client = createClient();
      const failed = client.post(query);
      const rejection = expect(failed).rejects.toThrow(error);
      const next = client.post(query);
      await setImmediate();
      expect(requests).toHaveLength(1);
      finish(requests[0]);
      await rejection;
      await setImmediate();
      expect(requests).toHaveLength(2);
      requests[1].reply();
      await next;
    }
  );

  test('a 401 handler that retries does not deadlock the queue', async () => {
    const client = createClient();
    client.set401ResponseHandler((_, __, retry) => retry());
    const first = client.post(query);
    const outcome = expect(first).resolves.toMatchObject({ status: 200 });
    const second = client.post(query);
    await setImmediate();
    requests[0].reply({}, 401);
    await setImmediate();
    expect(requests).toHaveLength(2);
    requests[1].reply();
    await second;
    await setImmediate();
    expect(requests).toHaveLength(3);
    requests[2].reply();
    await outcome;
  });

  test.each([
    [baseUrl, `${query}?debug=true`],
    [baseUrl, `${baseUrl}/cdf/api/v1/projects/p${query}/?debug=true#result`],
    [`${baseUrl}/gateway/cdf`, `/api/v1/projects/p${query}?debug=true`],
    [`${baseUrl}/cdf/api/v1/projects/p/`, 'toy/slow?debug=true'],
  ])(
    'classifies the effective pathname for base %s and path %s',
    async (base, path) => {
      const client = createClient();
      client.setBaseUrl(base);
      const results = [client.post(path), client.post(path)];
      await setImmediate();
      expect(requests).toHaveLength(1);
      requests[0].reply();
      await setImmediate();
      expect(requests).toHaveLength(2);
      requests[1].reply();
      await Promise.all(results);
    }
  );
});
