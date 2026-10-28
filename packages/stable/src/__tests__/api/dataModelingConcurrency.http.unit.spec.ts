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
});
