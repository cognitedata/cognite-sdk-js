// Copyright 2026 Cognite AS

import { describe, expect, test } from 'vitest';
import { HttpMethod } from './basicHttpClient';
import {
  DEFAULT_DATA_MODELING_CONCURRENCY,
  type DataModelingConcurrencyCategory,
  DataModelingConcurrencyLimiter,
  classifyDataModelingRequest,
} from './dataModelingConcurrency';

const schemaResources = ['spaces', 'containers', 'views', 'datamodels'];
const prefixes = [
  '',
  '/api/v1/projects/test-project',
  '/cdf/api/v1/projects/test-project',
  '/gateway/cdf/api/20230101/projects/test-project',
];
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
  [HttpMethod.Post, '/models/views-extra/byids', 'read'],
  [HttpMethod.Post, '/models/statistics-extra', 'read'],
  [HttpMethod.Get, '/models', 'read'],
  [HttpMethod.Post, '/models/future/operation', 'read'],
];

describe('Data Modeling request classification', () => {
  test.each(endpoints)('%s %s uses %s', (method, path, category) => {
    for (const prefix of prefixes) {
      expect(classifyDataModelingRequest(method, `${prefix}${path}`)).toBe(
        category
      );
      expect(classifyDataModelingRequest(method, `${prefix}${path}/`)).toBe(
        category
      );
    }
  });

  test.each([
    '/assets/list',
    '/3d/models/instances',
    '/3d/reveal/models/instances',
    '/simulators/models/instances/delete',
    '/models-other/instances',
    '/prefix/models/instances',
    '/templategroups/test/versions/1/graphql',
    '/userapis/spaces/test/datamodels/model/versions/v1/graphql-extra',
    '/userapis/spaces/test/datamodels/model/graphql',
    '/dml/graphql-extra',
    '/dml/graphql/extra',
  ])('does not limit %s', (path) => {
    for (const prefix of prefixes) {
      expect(
        classifyDataModelingRequest(HttpMethod.Post, `${prefix}${path}`)
      ).toBeUndefined();
    }
  });

  test.each([
    '/cdf/api/v1/projects-other/test/models/instances',
    '/cdf/api/v1/projects//models/instances',
    '/cdf/api/v1/projects/test/models-other/instances',
    '/cdf/api/v1/projects/test/prefix/models/instances',
    '/cdf/prefix/models/instances',
  ])('requires complete project and models path segments: %s', (path) => {
    expect(classifyDataModelingRequest(HttpMethod.Post, path)).toBeUndefined();
  });

  test('matches methods and complete operation paths', () => {
    expect(
      classifyDataModelingRequest(HttpMethod.Get, '/models/instances/search')
    ).toBe('read');
    expect(
      classifyDataModelingRequest(HttpMethod.Post, '/models/future/search')
    ).toBe('read');
    expect(
      classifyDataModelingRequest(
        HttpMethod.Post,
        '/models/instances/search-extra'
      )
    ).toBe('read');
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

  test.each<DataModelingConcurrencyCategory>([
    'read',
    'search',
    'write',
    'delete',
    'readSchema',
    'writeSchema',
  ])('rejects invalid limits for %s', (category) => {
    for (const max of [0, -1, 1.5, Number.NaN, Number.NEGATIVE_INFINITY]) {
      expect(
        () => new DataModelingConcurrencyLimiter({ [category]: max })
      ).toThrow(
        `dataModelingConcurrency.${category} must be a positive integer or Infinity`
      );
    }
  });

  test('accepts partial options, undefined and Infinity', () => {
    expect(
      () =>
        new DataModelingConcurrencyLimiter({
          read: undefined,
          search: 3,
          write: Number.POSITIVE_INFINITY,
          readSchema: undefined,
          writeSchema: Number.POSITIVE_INFINITY,
        })
    ).not.toThrow();
  });
});
