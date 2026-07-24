/*!
 * Copyright 2024 Cognite AS
 */

import { describe, expectTypeOf, test } from 'vitest';
import type { InstancesAPI } from '../../../api/instances/instancesApi';
import type {
  QueryRequest,
  QueryResponse,
  RawPropertyValueV3,
} from '../../../types';

describe('queryNodesEdges type tests (queryTyped – kept for back-compat)', () => {
  test('query result keys should match const query select keys', () => {
    type QueryResultSelectKeys = keyof Awaited<
      ReturnType<typeof InstancesAPI.prototype.queryTyped<typeof testQuery>>
    >['items'];

    expectTypeOf<QueryResultSelectKeys>().toEqualTypeOf<
      keyof typeof testQuery.select
    >();
  });

  test('Each source with unique space should map to a key in properties of result', () => {
    type ResultSourceSpaces = keyof Awaited<
      ReturnType<typeof InstancesAPI.prototype.queryTyped<typeof testQuery>>
    >['items']['resultExpressionA'][number]['properties'];

    type QueryResultSpaces =
      (typeof testQuery.select.resultExpressionA.sources)[number]['source']['space'];
    expectTypeOf<ResultSourceSpaces>().toEqualTypeOf<QueryResultSpaces>();
  });

  test('property keys of result should match property keys of sources', () => {
    type ResultPropertiesA = keyof Awaited<
      ReturnType<typeof InstancesAPI.prototype.queryTyped<typeof testQuery>>
    >['items']['resultExpressionA'][number]['properties']['spaceA']['externalIdA/v1'];
    type QueryPropertiesA =
      (typeof testQuery.select.resultExpressionA.sources)[0]['properties'][number];

    expectTypeOf<ResultPropertiesA>().toEqualTypeOf<QueryPropertiesA>();

    type ResultPropertiesB = keyof Awaited<
      ReturnType<typeof InstancesAPI.prototype.queryTyped<typeof testQuery>>
    >['items']['resultExpressionA'][number]['properties']['spaceA']['externalIdB/v1'];
    type QueryPropertiesB =
      (typeof testQuery.select.resultExpressionA.sources)[1]['properties'][number];

    expectTypeOf<ResultPropertiesB>().toEqualTypeOf<QueryPropertiesB>();

    type ResultPropertiesC = keyof Awaited<
      ReturnType<typeof InstancesAPI.prototype.queryTyped<typeof testQuery>>
    >['items']['resultExpressionA'][number]['properties']['spaceB']['externalIdC/v1'];
    type QueryPropertiesC =
      (typeof testQuery.select.resultExpressionA.sources)[2]['properties'][number];

    expectTypeOf<ResultPropertiesC>().toEqualTypeOf<QueryPropertiesC>();
  });

  test('passing a typed Source generic should return a typed results for parameters', () => {
    type SourceExternalIdAPropertyTypes = [
      {
        source: {
          type: 'view';
          space: 'spaceA';
          externalId: 'externalIdA';
          version: 'v1';
        };
        properties: {
          aPropOne: string;
          aPropTwo: number;
          aPropThree: { externalId: string; space: string };
        };
      },
    ];

    type TypedResultProperties = Awaited<
      ReturnType<
        typeof InstancesAPI.prototype.queryTyped<
          typeof testQuery,
          SourceExternalIdAPropertyTypes
        >
      >
    >['items']['resultExpressionA'][number]['properties']['spaceA']['externalIdA/v1'];

    expectTypeOf<TypedResultProperties>().toEqualTypeOf<
      SourceExternalIdAPropertyTypes[0]['properties']
    >();
  });

  test('Passing a non-constant query should be valid', () => {
    type QueryResult = Awaited<
      ReturnType<typeof InstancesAPI.prototype.queryTyped<QueryRequest>>
    >;

    type TestType = QueryResult extends QueryResponse ? true : false;

    expectTypeOf<TestType>().toEqualTypeOf<true>();
  });

  test('passing * as property should type properties as Record', () => {
    type ResultSourceSpaces = Awaited<
      ReturnType<typeof InstancesAPI.prototype.queryTyped<typeof testQuery>>
    >['items']['resultExpressionB'][number]['properties']['spaceD']['externalIdD/v1'];

    expectTypeOf<ResultSourceSpaces>().toEqualTypeOf<
      Record<string, RawPropertyValueV3>
    >();
  });
});

describe('query() Strategy B – conditional return type', () => {
  test('plain QueryRequest call returns QueryResponse (backward-compatible)', () => {
    type Result = Awaited<
      ReturnType<typeof InstancesAPI.prototype.query<QueryRequest>>
    >;

    expectTypeOf<Result>().toEqualTypeOf<QueryResponse>();
  });

  test('const query select keys are preserved in result items', () => {
    type QueryResultSelectKeys = keyof Awaited<
      ReturnType<typeof InstancesAPI.prototype.query<typeof testQuery>>
    >['items'];

    expectTypeOf<QueryResultSelectKeys>().toEqualTypeOf<
      keyof typeof testQuery.select
    >();
  });

  test('source spaces are inferred from const query', () => {
    type ResultSourceSpaces = keyof Awaited<
      ReturnType<typeof InstancesAPI.prototype.query<typeof testQuery>>
    >['items']['resultExpressionA'][number]['properties'];

    type QueryResultSpaces =
      (typeof testQuery.select.resultExpressionA.sources)[number]['source']['space'];
    expectTypeOf<ResultSourceSpaces>().toEqualTypeOf<QueryResultSpaces>();
  });

  test('property keys of result match property keys of const sources', () => {
    type ResultPropertiesA = keyof Awaited<
      ReturnType<typeof InstancesAPI.prototype.query<typeof testQuery>>
    >['items']['resultExpressionA'][number]['properties']['spaceA']['externalIdA/v1'];

    expectTypeOf<ResultPropertiesA>().toEqualTypeOf<
      (typeof testQuery.select.resultExpressionA.sources)[0]['properties'][number]
    >();
  });

  test('wildcard property (*) falls back to Record<string, RawPropertyValueV3>', () => {
    type ResultWildcard = Awaited<
      ReturnType<typeof InstancesAPI.prototype.query<typeof testQuery>>
    >['items']['resultExpressionB'][number]['properties']['spaceD']['externalIdD/v1'];

    expectTypeOf<ResultWildcard>().toEqualTypeOf<
      Record<string, RawPropertyValueV3>
    >();
  });
});

const testQuery = {
  with: {
    resultExpressionA: {
      nodes: {},
    },
    resultExpressionB: {
      nodes: {},
    },
    resultExpressionC: {
      edges: {},
    },
  },
  select: {
    resultExpressionA: {
      sources: [
        {
          source: {
            type: 'view',
            space: 'spaceA',
            externalId: 'externalIdA',
            version: 'v1',
          },
          properties: ['aPropOne', 'aPropTwo', 'aPropThree'],
        },
        {
          source: {
            type: 'view',
            space: 'spaceA',
            externalId: 'externalIdB',
            version: 'v1',
          },
          properties: ['bPropOne', 'bPropTwo'],
        },
        {
          source: {
            type: 'view',
            space: 'spaceB',
            externalId: 'externalIdC',
            version: 'v1',
          },
          properties: ['cPropOne'],
        },
      ],
    },
    resultExpressionB: {
      sources: [
        {
          source: {
            type: 'view',
            space: 'spaceD',
            externalId: 'externalIdD',
            version: 'v1',
          },
          properties: ['*'],
        },
      ],
    },
    resultExpressionC: {
      sources: [
        {
          source: {
            type: 'view',
            space: 'spaceE',
            externalId: 'externalIdE',
            version: 'v1',
          },
          properties: ['ePropOne', 'ePropTwo'],
        },
      ],
    },
  },
} as const satisfies QueryRequest;
