// Copyright 2026 Cognite AS

import {
  CDFHttpClient,
  ConcurrencyLimiter,
  createUniversalRetryValidator,
} from '@cognite/sdk-core';
import { Response } from 'cross-fetch';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import {
  controlFetch,
  deferred,
  flushRequests,
} from '../../../../core/src/__tests__/concurrencyTestUtils';
import { MAX_RETRY_ATTEMPTS } from '../../../../core/src/httpClient/retryValidator';
import {
  type DataModelingConcurrencyOptions,
  dataModelingConcurrencyPolicy,
} from '../../api/dataModeling/concurrency';

vi.mock('cross-fetch', async (importOriginal) => ({
  ...(await importOriginal<typeof import('cross-fetch')>()),
  default: vi.fn(),
}));

describe('Data Modeling HTTP concurrency', () => {
  let requests: ReturnType<typeof controlFetch>;
  const baseUrl = 'https://example.com';
  const query = '/api/v1/projects/test/models/instances/query';
  const createCdfClient = (options?: DataModelingConcurrencyOptions) => {
    const client = new CDFHttpClient(baseUrl, createUniversalRetryValidator());
    client.setConcurrencyLimiters([
      new ConcurrencyLimiter(dataModelingConcurrencyPolicy, options),
    ]);
    return client;
  };
  const createClient = (options?: DataModelingConcurrencyOptions) =>
    createCdfClient(options);

  beforeEach(() => {
    requests = controlFetch();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  test.each([
    [query, undefined, 1],
    ['/models/instances/search', undefined, 2],
    [query, { read: 3 }, 3],
    [query, { read: undefined }, 1],
    [query, { read: Number.POSITIVE_INFINITY }, 6],
    ['/models/views/byids', undefined, 2],
    ['/models/views/byids', { readSchema: 3 }, 3],
    ['/models/views/byids', { readSchema: undefined }, 2],
    ['/models/views/byids', { readSchema: Number.POSITIVE_INFINITY }, 6],
    ['/models/views', undefined, 1],
    ['/models/views', { writeSchema: 3 }, 3],
    ['/models/views', { writeSchema: undefined }, 1],
    ['/models/views', { writeSchema: Number.POSITIVE_INFINITY }, 6],
    ['/models/containers/indexes/delete', undefined, 1],
    [
      '/userapis/spaces/test/datamodels/model/versions/v1/graphql',
      undefined,
      1,
    ],
    ['/dml/graphql', undefined, 1],
    ['/assets/list', undefined, 6],
  ] satisfies [string, DataModelingConcurrencyOptions | undefined, number][])(
    'limits %s with %j to %s in-flight requests',
    async (path, options, limit) => {
      const client = createClient(options);
      const results = Array.from({ length: 6 }, () => client.post(path));
      let completed = 0;
      while (completed < results.length) {
        await flushRequests();
        const started = requests.length;
        expect(started - completed).toBe(
          Math.min(limit, results.length - completed)
        );
        for (; completed < started; completed++) {
          requests[completed].reply();
        }
      }
      await Promise.all(results);
    }
  );

  test('shares budgets within each of the six independent categories', async () => {
    const client = createClient();
    const paths = [
      query,
      '/models/instances/list',
      '/userapis/spaces/test/datamodels/model/versions/v1/graphql',
      '/models/instances/search',
      '/models/instances/aggregate',
      '/models/instances/search',
      '/models/instances',
      '/models/instances',
      '/models/instances/delete',
      '/models/instances/delete',
      '/models/views/byids',
      '/models/containers/byids',
      '/models/statistics/spaces/byids',
      '/models/spaces/byids',
      '/models/views',
      '/models/containers/indexes/delete',
      '/dml/graphql',
    ];
    const results = paths.map((path) => client.post(path));
    await flushRequests();
    expect(requests.map((request) => new URL(request.url).pathname)).toEqual([
      paths[0],
      paths[3],
      paths[4],
      paths[6],
      paths[8],
      paths[10],
      paths[11],
      paths[14],
    ]);
    for (let i = 0; i < paths.length; i++) {
      requests[i].reply();
      await flushRequests();
    }
    await Promise.all(results);
  });

  test.each([
    [baseUrl, '/api/v1/projects/test/models/views?usedFor=node&usedFor=record'],
    [
      baseUrl,
      '/api/v1/projects/test/models/instances/query/?debug=true#result',
    ],
    [baseUrl, `${baseUrl}/api/v1/projects/test/models/views?limit=10`],
    [`${baseUrl}/api/v1/projects/test/`, 'models/views?limit=10'],
    [`${baseUrl}/api/v1/projects/test/`, '/models/views/?limit=10'],
    [`${baseUrl}/cdf`, query],
    [
      `${baseUrl}/gateway/cdf`,
      '/api/v1/projects/test/models/views?usedFor=node&usedFor=record',
    ],
    [`${baseUrl}/cdf/api/v1/projects/test/`, 'models/views?limit=10'],
    [baseUrl, `${baseUrl}/cdf${query}/?debug=true#result`],
  ])(
    'classifies the effective pathname for base %s and path %s',
    async (base, path) => {
      const client = createClient({ readSchema: 1 });
      client.setBaseUrl(base);
      const results = [client.post(path), client.post(path)];
      await flushRequests();
      expect(requests).toHaveLength(1);
      requests[0].reply();
      await flushRequests();
      expect(requests).toHaveLength(2);
      requests[1].reply();
      await Promise.all(results);
    }
  );

  test('copies options instead of retaining mutable configuration', async () => {
    const options = { read: 1 };
    const client = createClient(options);
    options.read = 10;
    const results = [client.post(query), client.post(query)];
    await flushRequests();
    expect(requests).toHaveLength(1);
    requests[0].reply();
    await flushRequests();
    requests[1].reply();
    await Promise.all(results);
  });

  describe.each([
    ['/models/instances', '/models/instances'],
    ['/models/instances/delete', '/models/instances/delete'],
    ['/models/views', '/models/views'],
    ['/models/views/delete', '/models/views'],
    ['/models/containers/indexes/delete', '/models/views'],
    ['/models/containers/constraints/delete', '/models/views'],
  ])('POST %s shares the budget of %s', (path, budgetPath) => {
    test.each([
      'query parameters',
      'fragment',
      'absolute proxy URL',
      'separate params',
    ])('preserves the write/delete budget with %s', async (variant) => {
      const client = createClient({
        read: Number.POSITIVE_INFINITY,
        readSchema: Number.POSITIVE_INFINITY,
      });
      let requestPath = path;
      if (variant === 'query parameters') {
        requestPath += '?debug=true';
      } else if (variant === 'fragment') {
        requestPath += '#response';
      } else if (variant === 'absolute proxy URL') {
        requestPath = `${baseUrl}/cdf/api/v1/projects/test${path}/?debug=true#response`;
      }
      const first = client.post(budgetPath);
      const second = client.post(requestPath, {
        params: variant === 'separate params' ? { debug: true } : undefined,
      });
      await flushRequests();
      expect(requests).toHaveLength(1);
      requests[0].reply();
      await first;
      await flushRequests();
      expect(requests).toHaveLength(2);
      expect(requests[1].url).toBe(
        variant === 'absolute proxy URL'
          ? requestPath
          : `${baseUrl}${requestPath}${variant === 'separate params' ? '?debug=true' : ''}`
      );
      requests[1].reply();
      await second;
    });
  });

  test('GraphQL queries and mutations share the read budget, not the write/delete budgets', async () => {
    const client = createClient();
    const graphql =
      '/userapis/spaces/test/datamodels/model/versions/v1/graphql';
    const results = [
      client.post(query),
      client.post(graphql, {
        data: { query: '{ listMovie { items { externalId } } }' },
      }),
      client.post(graphql, {
        data: { query: 'mutation { upsertMovie(items: []) { externalId } }' },
      }),
      client.post(graphql, {
        data: { query: 'mutation { deleteMovie(items: []) { externalId } }' },
      }),
      client.post('/models/instances'),
      client.post('/models/instances/delete'),
    ];
    await flushRequests();
    expect(requests.map((request) => new URL(request.url).pathname)).toEqual([
      query,
      '/models/instances',
      '/models/instances/delete',
    ]);
    requests[0].reply();
    await results[0];
    for (let i = 3; i < 6; i++) {
      await flushRequests();
      expect(requests).toHaveLength(i + 1);
      expect(requests[i].url).toBe(`${baseUrl}${graphql}`);
      requests[i].reply();
      await results[i - 2];
    }
    requests[1].reply();
    requests[2].reply();
    await Promise.all(results);
  });

  test('holds the slot until the entire response body is consumed', async () => {
    const client = createClient();
    const results = [client.post(query), client.post(query)];
    await flushRequests();
    const body = deferred<unknown>();
    const fallback = deferred<string>();
    const response = new Response();
    const clone = new Response();
    vi.spyOn(response, 'json').mockReturnValue(body.promise);
    vi.spyOn(clone, 'text').mockReturnValue(fallback.promise);
    vi.spyOn(response, 'clone').mockReturnValue(clone);
    requests[0].resolve(response);
    await flushRequests();
    expect(requests).toHaveLength(1);
    body.resolve({ items: [] });
    await flushRequests();
    expect(requests).toHaveLength(1);
    fallback.resolve('{"items":[]}');
    await results[0];
    await flushRequests();
    expect(requests).toHaveLength(2);
    requests[1].reply();
    await Promise.all(results);
  });

  test('releases during 429 backoff and reacquires behind queued requests', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    const client = createClient();
    const first = client.post(query);
    const second = client.post(query);
    await flushRequests();
    requests[0].reply({}, 429);
    await flushRequests();
    expect(requests).toHaveLength(2);
    expect(vi.getTimerCount()).toBe(1);
    await vi.runAllTimersAsync();
    expect(requests).toHaveLength(2);
    requests[1].reply();
    await second;
    await flushRequests();
    expect(requests).toHaveLength(3);
    requests[2].reply();
    await first;
  });

  test('transport failures release slots without changing rejection behavior', async () => {
    const client = createClient();
    const failed = client.post(query);
    const rejection = expect(failed).rejects.toThrow('connection failed');
    const next = client.post(query);
    await flushRequests();
    requests[0].reject(new Error('connection failed'));
    await rejection;
    await flushRequests();
    expect(requests).toHaveLength(2);
    requests[1].reply();
    await next;
  });

  test('reclassifies a retry after its base URL changes during backoff', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    const client = createClient();
    const path = '/models/instances/query';
    client.setBaseUrl(`${baseUrl}/unrelated`);
    const first = client.post(path);
    await flushRequests();
    requests[0].reply({}, 429);
    await flushRequests();
    client.setBaseUrl(baseUrl);
    const second = client.post(path);
    await flushRequests();
    expect(requests).toHaveLength(2);
    await vi.runAllTimersAsync();
    expect(requests).toHaveLength(2);
    requests[1].reply();
    await second;
    await flushRequests();
    expect(requests).toHaveLength(3);
    expect(requests[2].url).toBe(`${baseUrl}${path}`);
    requests[2].reply();
    await first;
  });

  test('reclassifies a retry after its validator changes the request path', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    const client = createClient();
    const search = '/models/instances/search';
    const first = client.post(query, {
      retryValidator: (request, response) => {
        if (response.status !== 429) return false;
        request.path = search;
        return true;
      },
    });
    await flushRequests();
    requests[0].reply({}, 429);
    await flushRequests();
    const searches = [client.post(search), client.post(search)];
    await flushRequests();
    expect(requests).toHaveLength(3);
    await vi.runAllTimersAsync();
    expect(requests).toHaveLength(3);
    requests[1].reply();
    await searches[0];
    await flushRequests();
    expect(requests).toHaveLength(4);
    expect(requests[3].url).toBe(`${baseUrl}${search}`);
    requests[2].reply();
    requests[3].reply();
    await Promise.all([first, ...searches]);
  });

  test('exhausted retries leave the queue usable', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    const client = createClient();
    const failed = client.post(query);
    const rejection = expect(failed).rejects.toThrow('status code: 429');
    for (let i = 0; i <= MAX_RETRY_ATTEMPTS; i++) {
      await flushRequests();
      expect(requests).toHaveLength(i + 1);
      requests[i].reply({}, 429);
      await flushRequests();
      await vi.runAllTimersAsync();
    }
    await rejection;
    const next = client.post(query);
    await flushRequests();
    requests[MAX_RETRY_ATTEMPTS + 1].reply();
    await next;
  });

  test('disabling retries does not disable concurrency limits', async () => {
    const client = createClient();
    const failed = client.post(query, { retryValidator: false });
    const rejection = expect(failed).rejects.toThrow('status code: 429');
    const next = client.post(query, { retryValidator: false });
    await flushRequests();
    expect(requests).toHaveLength(1);
    requests[0].reply({}, 429);
    await rejection;
    await flushRequests();
    expect(requests).toHaveLength(2);
    requests[1].reply();
    await next;
    expect(requests).toHaveLength(2);
  });

  test.each([true, false])(
    '401 handling leaves the queue usable (retry: %s)',
    async (retryAuthentication) => {
      const client = createCdfClient();
      client.set401ResponseHandler((_, __, retry, reject) => {
        if (retryAuthentication) {
          client.setBearerToken('refreshed');
          retry();
        } else {
          reject();
        }
      });
      const first = client.post(query);
      const outcome = retryAuthentication
        ? expect(first).resolves.toMatchObject({ status: 200 })
        : expect(first).rejects.toThrow('status code: 401');
      const second = client.post(query);
      await flushRequests();
      requests[0].reply({}, 401);
      await flushRequests();
      expect(requests).toHaveLength(2);
      requests[1].reply();
      await second;
      await flushRequests();
      if (retryAuthentication) {
        expect(requests).toHaveLength(3);
        expect(requests[2].options?.headers).toMatchObject({
          Authorization: 'Bearer refreshed',
        });
        requests[2].reply();
      }
      await outcome;
    }
  );
});
