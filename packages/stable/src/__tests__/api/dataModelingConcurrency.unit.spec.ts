// Copyright 2026 Cognite AS

/// <reference lib="es2024.promise" />

import { setImmediate } from 'node:timers/promises';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { controlFetch } from '../../../../core/src/__tests__/concurrencyTestUtils';
import type { ClientOptions } from '../../index';
import { setupMockableClient } from '../testUtils';

vi.mock('cross-fetch', async (importOriginal) => ({
  ...(await importOriginal<typeof import('cross-fetch')>()),
  default: vi.fn(),
}));

describe('Client Data Modeling concurrency', () => {
  let requests: ReturnType<typeof controlFetch>;
  const createClient = (options: Partial<ClientOptions> = {}) =>
    setupMockableClient({
      project: 'test',
      concurrency: {},
      ...options,
    });

  let warn: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    requests = controlFetch();
    warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => vi.restoreAllMocks());

  test('schema writes and deletes share a slot separately from instance writes and deletes', async () => {
    const client = createClient();
    const results = [
      client.views.upsert([]),
      client.spaces.delete(['test']),
      client.instances.upsert({ items: [] }),
      client.instances.delete([
        { instanceType: 'node', space: 'test', externalId: 'node' },
      ]),
    ];
    await setImmediate();
    expect(requests.map((request) => new URL(request.url).pathname)).toEqual([
      '/api/v1/projects/test/models/views',
      '/api/v1/projects/test/models/instances',
      '/api/v1/projects/test/models/instances/delete',
    ]);
    requests[0].reply({ items: [] });
    await setImmediate();
    expect(requests).toHaveLength(4);
    expect(new URL(requests[3].url).pathname).toBe(
      '/api/v1/projects/test/models/spaces/delete'
    );
    for (const request of requests.slice(1)) request.reply({ items: [] });
    await Promise.all(results);
  });

  test('raw and typed calls share a budget, but separate clients do not', async () => {
    const client = createClient();
    const other = createClient();
    const results = [
      client.instances.query({ with: {}, select: {} }),
      client.post('/api/v1/projects/test/models/instances/query?debug=true'),
      other.instances.query({ with: {}, select: {} }),
    ];
    await setImmediate();
    expect(requests).toHaveLength(2);
    requests[0].reply({});
    requests[1].reply({});
    await setImmediate();
    expect(requests).toHaveLength(3);
    requests[2].reply({});
    await Promise.all(results);
  });

  test('does not limit requests unless concurrency is set', async () => {
    const client = createClient({ concurrency: undefined });
    expect(warn).not.toHaveBeenCalled();
    const results = Array.from({ length: 4 }, () =>
      client.instances.query({ with: {}, select: {} })
    );
    await setImmediate();
    expect(requests).toHaveLength(4);
    for (const request of requests) request.reply();
    await Promise.all(results);
  });

  test('passes client overrides through to the HTTP stack', async () => {
    const client = createClient({
      concurrency: { dataModeling: { read: 3 } },
    });
    const results = Array.from({ length: 6 }, () =>
      client.instances.query({ with: {}, select: {} })
    );
    let completed = 0;
    while (completed < results.length) {
      await setImmediate();
      const started = requests.length;
      expect(started - completed).toBe(Math.min(3, results.length - completed));
      for (; completed < started; completed++) requests[completed].reply();
    }
    await Promise.all(results);
  });
});
