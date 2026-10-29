// Copyright 2026 Cognite AS

/// <reference lib="es2024.promise" />

import { setImmediate } from 'node:timers/promises';
import {
  CDFHttpClient,
  createUniversalRetryValidator,
} from '@cognite/sdk-core';
import { beforeEach, describe, expect, test } from 'vitest';
import { controlFetch } from '../../../../core/src/__tests__/concurrencyTestUtils';
import {
  type DataModelingConcurrencyOptions,
  dataModelingConcurrencyPolicy,
} from '../../api/dataModeling/concurrency';

describe('Data Modeling HTTP concurrency', () => {
  let fake: ReturnType<typeof controlFetch>;
  let requests: typeof fake.requests;
  const baseUrl = 'https://example.com';
  const query = '/api/v1/projects/test/models/instances/query';
  const createClient = (options?: DataModelingConcurrencyOptions) => {
    const client = new CDFHttpClient(
      baseUrl,
      createUniversalRetryValidator(),
      fake.fetch
    );
    client.setConcurrencyPolicies([
      { policy: dataModelingConcurrencyPolicy, options },
    ]);
    return client;
  };
  const N_REQUESTS = 6;

  // Fires N_REQUESTS at once and answers them as slots free up. Returns
  // how many requests were in flight in each wave, e.g. [2, 2, 2] or [6].
  const inFlightPerWave = async (
    path: string,
    options?: DataModelingConcurrencyOptions
  ) => {
    const client = createClient(options);
    const results = Array.from({ length: N_REQUESTS }, () => client.post(path));
    const waves: number[] = [];
    let completed = 0;
    while (completed < N_REQUESTS) {
      await setImmediate();
      waves.push(requests.length - completed);
      for (const started = requests.length; completed < started; completed++) {
        requests[completed].reply();
      }
    }
    await Promise.all(results);
    return waves;
  };

  beforeEach(() => {
    fake = controlFetch();
    requests = fake.requests;
  });

  describe.each([
    { category: 'instance read', path: query, limit: 1 },
    { category: 'instance search', path: '/models/instances/search', limit: 2 },
    { category: 'view read', path: '/models/views/byids', limit: 2 },
    { category: 'schema write', path: '/models/views', limit: 1 },
    {
      category: 'schema delete',
      path: '/models/containers/indexes/delete',
      limit: 1,
    },
    {
      category: 'GraphQL',
      path: '/userapis/spaces/test/datamodels/model/versions/v1/graphql',
      limit: 1,
    },
    { category: 'DML GraphQL', path: '/dml/graphql', limit: 1 },
  ])('$category ($path)', ({ path, limit }) => {
    test(`allows ${limit} in flight by default`, async () => {
      const waves = await inFlightPerWave(path);
      expect(Math.max(...waves)).toBe(limit);
    });
  });

  test('read limit can be raised', async () => {
    const waves = await inFlightPerWave(query, { read: 3 });
    expect(Math.max(...waves)).toBe(3);
  });

  test('read: Infinity disables limiting', async () => {
    const waves = await inFlightPerWave(query, {
      read: Number.POSITIVE_INFINITY,
    });
    expect(waves).toEqual([N_REQUESTS]);
  });

  test('other endpoints are not limited', async () => {
    expect(await inFlightPerWave('/assets/list')).toEqual([N_REQUESTS]);
  });
});
