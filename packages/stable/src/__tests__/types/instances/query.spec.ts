/*!
 * Copyright 2024 Cognite AS
 */

import type { QueryRequest, QueryResponse } from 'stable/src/types';
import { describe, test } from 'vitest';
import type CogniteClient from '../../../cogniteClient';

type Expect<T extends true> = T;
type Equal<X, Y> = (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y
  ? 1
  : 2
  ? true
  : false;

describe('queryNodesEdges type tests', () => {
  test('calling query without type param returns QueryResponse (non-breaking default)', () => {
    type Result = Awaited<
      ReturnType<typeof CogniteClient.prototype.instances.query>
    >;

    true satisfies Expect<Equal<Result, QueryResponse>>;
  });

  test('calling query with plain QueryRequest also returns QueryResponse', () => {
    type Result = Awaited<
      ReturnType<typeof CogniteClient.prototype.instances.query<QueryRequest>>
    >;

    true satisfies Expect<Equal<Result, QueryResponse>>;
  });

  test('query result keys should match const query select keys', () => {
    type QueryResultSelectKeys = keyof Awaited<
      ReturnType<
        typeof CogniteClient.prototype.instances.query<typeof testQuery>
      >
    >['items'];

    true satisfies Expect<
      Equal<QueryResultSelectKeys, keyof typeof testQuery.select>
    >;
  });

  test('Each source with unique space should map to a key in properties of result', () => {
    type ResultSourceSpaces = keyof Awaited<
      ReturnType<
        typeof CogniteClient.prototype.instances.query<typeof testQuery>
      >
    >['items']['resultExpressionA'][number]['properties'];

    type QueryResultSpaces =
      (typeof testQuery.select.resultExpressionA.sources)[number]['source']['space'];

    true satisfies Expect<Equal<ResultSourceSpaces, QueryResultSpaces>>;
  });

  test('property keys of result should match property keys of sources', () => {
    type ResultPropertiesA = keyof Awaited<
      ReturnType<
        typeof CogniteClient.prototype.instances.query<typeof testQuery>
      >
    >['items']['resultExpressionA'][number]['properties']['spaceA']['externalIdA/v1'];
    type QueryPropertiesA =
      (typeof testQuery.select.resultExpressionA.sources)[0]['properties'][number];
    true satisfies Expect<Equal<ResultPropertiesA, QueryPropertiesA>>;

    type ResultPropertiesB = keyof Awaited<
      ReturnType<
        typeof CogniteClient.prototype.instances.query<typeof testQuery>
      >
    >['items']['resultExpressionA'][number]['properties']['spaceA']['externalIdB/v1'];
    type QueryPropertiesB =
      (typeof testQuery.select.resultExpressionA.sources)[1]['properties'][number];
    true satisfies Expect<Equal<ResultPropertiesB, QueryPropertiesB>>;

    type ResultPropertiesC = keyof Awaited<
      ReturnType<
        typeof CogniteClient.prototype.instances.query<typeof testQuery>
      >
    >['items']['resultExpressionA'][number]['properties']['spaceB']['externalIdC/v1'];
    type QueryPropertiesC =
      (typeof testQuery.select.resultExpressionA.sources)[2]['properties'][number];
    true satisfies Expect<Equal<ResultPropertiesC, QueryPropertiesC>>;
  });

  test('passing a typed Source generic should return typed property values', () => {
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
        typeof CogniteClient.prototype.instances.query<
          typeof testQuery,
          SourceExternalIdAPropertyTypes
        >
      >
    >['items']['resultExpressionA'][number]['properties']['spaceA']['externalIdA/v1'];

    true satisfies Expect<
      Equal<
        TypedResultProperties,
        SourceExternalIdAPropertyTypes[0]['properties']
      >
    >;
  });

  test('passing * as property should type properties as Record', () => {
    type ResultSourceSpaces = Awaited<
      ReturnType<
        typeof CogniteClient.prototype.instances.query<typeof testQuery>
      >
    >['items']['resultExpressionB'][number]['properties']['spaceD']['externalIdD/v1'];

    // @ts-expect-error - property key should not be the string '*'
    true satisfies Expect<Equal<ResultSourceSpaces, '*'>>;

    true satisfies Expect<Equal<ResultSourceSpaces, Record<string, unknown>>>;
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
