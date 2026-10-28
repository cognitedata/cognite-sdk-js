// Copyright 2026 Cognite AS

/// <reference lib="es2024.promise" />

import { setImmediate } from 'node:timers/promises';
import {
  CDFHttpClient,
  createUniversalRetryValidator,
} from '@cognite/sdk-core';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { controlFetch } from '../../../../core/src/__tests__/concurrencyTestUtils';
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
  const createClient = (options?: DataModelingConcurrencyOptions) => {
    const client = new CDFHttpClient(baseUrl, createUniversalRetryValidator());
    client.setConcurrencyPolicies([
      { policy: dataModelingConcurrencyPolicy, options },
    ]);
    return client;
  };

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
    [query, { read: Number.POSITIVE_INFINITY }, 6],
    ['/models/views/byids', undefined, 2],
    ['/models/views', undefined, 1],
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
        await setImmediate();
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
      await setImmediate();
      expect(requests).toHaveLength(1);
      requests[0].reply();
      await setImmediate();
      expect(requests).toHaveLength(2);
      requests[1].reply();
      await Promise.all(results);
    }
  );

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
      await setImmediate();
      expect(requests).toHaveLength(1);
      requests[0].reply();
      await first;
      await setImmediate();
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
    await setImmediate();
    expect(requests.map((request) => new URL(request.url).pathname)).toEqual([
      query,
      '/models/instances',
      '/models/instances/delete',
    ]);
    requests[0].reply();
    await results[0];
    for (let i = 3; i < 6; i++) {
      await setImmediate();
      expect(requests).toHaveLength(i + 1);
      expect(requests[i].url).toBe(`${baseUrl}${graphql}`);
      requests[i].reply();
      await results[i - 2];
    }
    requests[1].reply();
    requests[2].reply();
    await Promise.all(results);
  });
});
