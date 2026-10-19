// Copyright 2026 Cognite AS

import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import {
  controlFetch,
  flushRequests,
} from '../../../../core/src/__tests__/concurrencyTestUtils';
import {
  type ClientOptions,
  CogniteClient,
  DEFAULT_DATA_MODELING_CONCURRENCY,
  type DataModelingConcurrencyOptions,
} from '../../index';

vi.mock('cross-fetch', async (importOriginal) => ({
  ...(await importOriginal<typeof import('cross-fetch')>()),
  default: vi.fn(),
}));

describe('Client Data Modeling concurrency', () => {
  let requests: ReturnType<typeof controlFetch>;
  const createClient = (options: Partial<ClientOptions> = {}) =>
    new CogniteClient({
      appId: 'concurrency test',
      project: 'test',
      baseUrl: 'https://example.com',
      oidcTokenProvider: async () => 'test token',
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
      await flushRequests();
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
    await flushRequests();
    requests[0].reply({ error: { code: 400, message: 'Invalid delete' } }, 400);
    await flushRequests();
    expect(requests).toHaveLength(2);
    requests[1].reply({ items: [] });
    await rejection;
  });

  test('schema reads share two default slots independently of instance reads', async () => {
    const client = createClient();
    const results = [
      client.containers.list(),
      client.views.list(),
      client.spaces.list(),
      client.instances.query({ with: {}, select: {} }),
    ];
    await flushRequests();
    expect(requests.map((request) => new URL(request.url).pathname)).toEqual([
      '/api/v1/projects/test/models/containers/',
      '/api/v1/projects/test/models/views/',
      '/api/v1/projects/test/models/instances/query',
    ]);
    requests[0].reply({ items: [] });
    await flushRequests();
    expect(requests).toHaveLength(4);
    expect(new URL(requests[3].url).pathname).toBe(
      '/api/v1/projects/test/models/spaces/'
    );
    for (const request of requests.slice(1)) request.reply({ items: [] });
    await Promise.all(results);
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
    await flushRequests();
    expect(requests.map((request) => new URL(request.url).pathname)).toEqual([
      '/api/v1/projects/test/models/views',
      '/api/v1/projects/test/models/instances',
      '/api/v1/projects/test/models/instances/delete',
    ]);
    requests[0].reply({ items: [] });
    await flushRequests();
    expect(requests).toHaveLength(4);
    expect(new URL(requests[3].url).pathname).toBe(
      '/api/v1/projects/test/models/spaces/delete'
    );
    for (const request of requests.slice(1)) request.reply({ items: [] });
    await Promise.all(results);
  });

  test('schema read overrides preserve query serialization during pagination', async () => {
    const client = createClient({ dataModelingConcurrency: { readSchema: 1 } });
    const containers = client.containers.list();
    const views = client.views.list({
      usedFor: ['node', 'record'],
      includeGlobal: false,
      limit: 1,
    });
    await flushRequests();
    expect(requests).toHaveLength(1);
    expect(requests[0].url).toBe(
      'https://example.com/api/v1/projects/test/models/containers/?includeGlobal=false'
    );
    requests[0].reply({ items: [] });
    await containers;
    await flushRequests();
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
    await flushRequests();
    expect(requests).toHaveLength(3);
    const nextUrl = new URL(requests[2].url);
    expect(nextUrl.searchParams.getAll('usedFor')).toEqual(['node', 'record']);
    expect(nextUrl.searchParams.get('cursor')).toBe('next');
    expect(nextUrl.searchParams.get('limit')).toBe('1');
    expect(nextUrl.searchParams.get('includeGlobal')).toBe('false');
    requests[2].reply({ items: [] });
    await nextPage;
    await flushRequests();
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
    await flushRequests();
    expect(requests).toHaveLength(2);
    requests[0].reply({});
    requests[1].reply({});
    await flushRequests();
    expect(requests).toHaveLength(3);
    requests[2].reply({});
    await Promise.all(results);
  });

  test.each([
    [{ read: 3 }, 3],
    [
      {
        read: Number.POSITIVE_INFINITY,
        search: Number.POSITIVE_INFINITY,
        write: Number.POSITIVE_INFINITY,
        delete: Number.POSITIVE_INFINITY,
        readSchema: Number.POSITIVE_INFINITY,
        writeSchema: Number.POSITIVE_INFINITY,
      },
      6,
    ],
  ] satisfies [DataModelingConcurrencyOptions, number][])(
    'passes client overrides %j through to the HTTP stack',
    async (dataModelingConcurrency, limit) => {
      const client = createClient({ dataModelingConcurrency });
      const results = Array.from({ length: 6 }, () =>
        client.instances.query({ with: {}, select: {} })
      );
      let completed = 0;
      while (completed < results.length) {
        await flushRequests();
        const started = requests.length;
        expect(started - completed).toBe(
          Math.min(limit, results.length - completed)
        );
        for (; completed < started; completed++) requests[completed].reply();
      }
      await Promise.all(results);
    }
  );

  test.each(['readSchema', 'writeSchema'] as const)(
    'passes %s overrides through to the HTTP stack',
    async (category) => {
      const client = createClient({
        dataModelingConcurrency: { [category]: 3 },
      });
      const results = Array.from({ length: 4 }, () =>
        category === 'readSchema'
          ? client.views.list()
          : client.views.upsert([])
      );
      await flushRequests();
      expect(requests).toHaveLength(3);
      requests[0].reply({ items: [] });
      await flushRequests();
      expect(requests).toHaveLength(4);
      for (const request of requests.slice(1)) request.reply({ items: [] });
      await Promise.all(results);
    }
  );

  test('fails at construction on invalid options and exposes public defaults', () => {
    expect(DEFAULT_DATA_MODELING_CONCURRENCY.read).toBe(1);
    expect(DEFAULT_DATA_MODELING_CONCURRENCY.readSchema).toBe(2);
    expect(DEFAULT_DATA_MODELING_CONCURRENCY.writeSchema).toBe(1);
    for (const category of ['delete', 'readSchema', 'writeSchema']) {
      expect(() =>
        createClient({ dataModelingConcurrency: { [category]: 0 } })
      ).toThrow(`dataModelingConcurrency.${category}`);
    }
  });

  test.each([true, false])(
    'authentication succeeds or fails without blocking the queue (%s)',
    async (authenticate) => {
      const tokenProvider = vi.fn(async () => {
        if (!authenticate) throw new Error('authentication failed');
        return 'fresh token';
      });
      const client = createClient({ oidcTokenProvider: tokenProvider });
      const first = client.instances.query({ with: {}, select: {} });
      const outcome = authenticate
        ? expect(first).resolves.toEqual({})
        : expect(first).rejects.toThrow();
      const second = client.instances.query({ with: {}, select: {} });
      await flushRequests();
      requests[0].reply({}, 401);
      await flushRequests();
      expect(requests).toHaveLength(2);
      requests[1].reply();
      await second;
      await flushRequests();
      expect(tokenProvider).toHaveBeenCalledOnce();
      if (authenticate) {
        expect(requests).toHaveLength(3);
        expect(requests[2].options?.headers).toMatchObject({
          Authorization: 'Bearer fresh token',
        });
        requests[2].reply();
      }
      await outcome;
    }
  );
});
