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
      ...options,
    });

  beforeEach(() => {
    requests = controlFetch();
  });

  afterEach(() => vi.restoreAllMocks());

  test('deletes 3000 instances in three serialized chunks', async () => {
    const client = createClient();
    const items = Array.from({ length: 3000 }, (_, index) => ({
      instanceType: 'node' as const,
      space: 'test',
      externalId: String(index),
    }));
    const result = client.instances.delete(items);
    for (let i = 0; i < 3; i++) {
      await setImmediate();
      expect(requests).toHaveLength(i + 1);
      expect(new URL(requests[i].url).pathname).toBe(
        '/api/v1/projects/test/models/instances/delete'
      );
      expect(JSON.parse(String(requests[i].options?.body))).toEqual({
        items: items.slice(i * 1000, (i + 1) * 1000),
      });
      requests[i].reply({ items: items.slice(i * 1000, (i + 1) * 1000) });
    }
    await expect(result).resolves.toEqual({});
  });

  test('preserves chunked delete failures and continues queued chunks', async () => {
    const client = createClient();
    const items = Array.from({ length: 1001 }, (_, index) => ({
      instanceType: 'node' as const,
      space: 'test',
      externalId: String(index),
    }));
    const result = client.instances.delete(items);
    const rejection = expect(result).rejects.toThrow();
    await setImmediate();
    requests[0].reply({ error: { code: 400, message: 'Invalid delete' } }, 400);
    await setImmediate();
    expect(requests).toHaveLength(2);
    requests[1].reply({ items: [] });
    await rejection;
  });

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

  test('schema read overrides preserve query serialization during pagination', async () => {
    const client = createClient({
      concurrency: { dataModeling: { readSchema: 1 } },
    });
    const containers = client.containers.list();
    const views = client.views.list({
      usedFor: ['node', 'record'],
      includeGlobal: false,
      limit: 1,
    });
    await setImmediate();
    expect(requests).toHaveLength(1);
    expect(requests[0].url).toBe(
      'https://example.com/api/v1/projects/test/models/containers/?includeGlobal=false'
    );
    requests[0].reply({ items: [] });
    await containers;
    await setImmediate();
    expect(requests).toHaveLength(2);
    expect(new URL(requests[1].url).searchParams.getAll('usedFor')).toEqual([
      'node',
      'record',
    ]);
    requests[1].reply({ items: [], nextCursor: 'next' });
    const firstPage = await views;
    const nextPage = firstPage.next?.();
    expect(nextPage).toBeDefined();
    const defaultViews = client.views.list();
    await setImmediate();
    expect(requests).toHaveLength(3);
    const nextUrl = new URL(requests[2].url);
    expect(nextUrl.searchParams.getAll('usedFor')).toEqual(['node', 'record']);
    expect(nextUrl.searchParams.get('cursor')).toBe('next');
    expect(nextUrl.searchParams.get('limit')).toBe('1');
    expect(nextUrl.searchParams.get('includeGlobal')).toBe('false');
    requests[2].reply({ items: [] });
    await nextPage;
    await setImmediate();
    expect(requests).toHaveLength(4);
    expect(requests[3].url).toBe(
      'https://example.com/api/v1/projects/test/models/views/?includeGlobal=false'
    );
    requests[3].reply({ items: [] });
    await defaultViews;
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
