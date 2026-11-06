// Copyright 2026 Cognite AS

import { HttpMethod } from '@cognite/sdk-core';
import { describe, expect, test } from 'vitest';
import { ConcurrencyLimiter } from '../../../../core/src/httpClient/concurrencyLimiter';
import {
  DEFAULT_DATA_MODELING_CONCURRENCY,
  type DataModelingConcurrencyCategory,
  dataModelingConcurrencyPolicy,
} from '../../api/dataModeling/concurrency';

const limiter = new ConcurrencyLimiter([
  { policy: dataModelingConcurrencyPolicy },
]);
const classifyDataModelingRequest = (method: HttpMethod, path: string) =>
  limiter.classify(method, path);

const schemaResources = ['spaces', 'containers', 'views', 'datamodels'];
const endpoints: [HttpMethod, string, DataModelingConcurrencyCategory][] = [
  [HttpMethod.Post, '/models/instances', 'write'],
  [HttpMethod.Post, '/models/instances/byids', 'read'],
  [HttpMethod.Post, '/models/instances/delete', 'delete'],
  ...schemaResources.flatMap(
    (resource): [HttpMethod, string, DataModelingConcurrencyCategory][] => [
      [HttpMethod.Post, `/models/${resource}`, 'writeSchema'],
      [HttpMethod.Post, `/models/${resource}/byids`, 'readSchema'],
      [HttpMethod.Post, `/models/${resource}/delete`, 'writeSchema'],
      [HttpMethod.Get, `/models/${resource}`, 'readSchema'],
    ]
  ),
  ...['list', 'query', 'sync', 'inspect'].map(
    (operation): [HttpMethod, string, DataModelingConcurrencyCategory] => [
      HttpMethod.Post,
      `/models/instances/${operation}`,
      'read',
    ]
  ),
  [HttpMethod.Post, '/models/instances/search', 'search'],
  [HttpMethod.Post, '/models/instances/aggregate', 'search'],
  [HttpMethod.Post, '/models/containers/inspect', 'readSchema'],
  [HttpMethod.Post, '/models/containers/indexes/delete', 'writeSchema'],
  [HttpMethod.Post, '/models/containers/constraints/delete', 'writeSchema'],
  [HttpMethod.Post, '/models/containers/indexes/retry', 'writeSchema'],
  [HttpMethod.Post, '/models/containers/constraints/retry', 'writeSchema'],
  [HttpMethod.Post, '/models/containers/properties/retry', 'writeSchema'],
  [HttpMethod.Get, '/models/statistics', 'readSchema'],
  [HttpMethod.Get, '/models/statistics/spaces', 'readSchema'],
  [HttpMethod.Post, '/models/statistics/spaces/byids', 'readSchema'],
  [
    HttpMethod.Post,
    '/userapis/spaces/test/datamodels/model/versions/v1/graphql',
    'read',
  ],
  [HttpMethod.Post, '/dml/graphql', 'writeSchema'],
  [HttpMethod.Post, '/models/containers/future-operation', 'readSchema'],
  [HttpMethod.Post, '/models/future/operation', 'read'],
];

describe('Data Modeling request classification', () => {
  test.each(endpoints)('%s %s uses %s', (method, path, category) => {
    expect(classifyDataModelingRequest(method, path)).toBe(category);
  });

  test.each([
    '/assets/list',
    '/3d/models/instances',
    '/3d/reveal/models/instances',
    '/simulators/models/instances/delete',
    '/models-other/instances',
    '/prefix/models/instances',
    '/templategroups/test/versions/1/graphql',
    '/dml/graphql/extra',
  ])('does not limit %s', (path) => {
    expect(classifyDataModelingRequest(HttpMethod.Post, path)).toBeUndefined();
  });
});

describe('Data Modeling concurrency options', () => {
  test('exports immutable defaults', () => {
    expect(DEFAULT_DATA_MODELING_CONCURRENCY).toEqual({
      read: 1,
      search: 2,
      write: 1,
      delete: 1,
      readSchema: 2,
      writeSchema: 1,
    });
    expect(Object.isFrozen(DEFAULT_DATA_MODELING_CONCURRENCY)).toBe(true);
  });
});
