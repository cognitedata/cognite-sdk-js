/*!
 * Copyright 2024 Cognite AS
 */

import { QueryRequest } from 'stable/src/types';
import CogniteClient from '../../../cogniteClient';

type Expect<T extends true> = T;
type Equal<X, Y> =
  (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2 ? true : false;

describe('queryNodesEdges type tests', () => {
  test('query result keys should match const query select keys', () => {
    type QueryResultSelectKeys = keyof Awaited<ReturnType<typeof CogniteClient.prototype.instances.query<typeof testQuery>>>['items'];
    type Assert = Expect<Equal<QueryResultSelectKeys, keyof typeof testQuery.select>>;

    // @ts-ignore
    type _ = Assert;
  });

  test('Each source with unique space should map to a key in properties of result', () => {
    type ResultSourceSpaces = keyof Awaited<ReturnType<
      typeof CogniteClient.prototype.instances.query<typeof testQuery>
    >>['items']['resultExpressionA'][number]['properties'];

    type QueryResultSpaces =
      (typeof testQuery.select.resultExpressionA.sources)[number]['source']['space'];
    type Assert = Expect<Equal<ResultSourceSpaces, QueryResultSpaces>>;

    // @ts-ignore
    type _ = Assert;
  });

  test('property keys of result should match property keys of sources', () => {
    type ResultPropertiesA = keyof Awaited<ReturnType<
      typeof CogniteClient.prototype.instances.query<typeof testQuery>
    >>['items']['resultExpressionA'][number]['properties']['spaceA']['externalIdA/v1'];
    type QueryPropertiesA =
      (typeof testQuery.select.resultExpressionA.sources)[0]['properties'][number];

    type Assert0 = Expect<Equal<ResultPropertiesA, QueryPropertiesA>>;
    // @ts-ignore
    type _0 = Assert0;

    type ResultPropertiesB = keyof Awaited<ReturnType<
      typeof CogniteClient.prototype.instances.query<typeof testQuery>
    >>['items']['resultExpressionA'][number]['properties']['spaceA']['externalIdB/v1'];
    type QueryPropertiesB =
      (typeof testQuery.select.resultExpressionA.sources)[1]['properties'][number];

    type Assert1 = Expect<Equal<ResultPropertiesB, QueryPropertiesB>>;
    // @ts-ignore
    type _1 = Assert1;

    type ResultPropertiesC = keyof Awaited<ReturnType<
      typeof CogniteClient.prototype.instances.query<typeof testQuery>
    >>['items']['resultExpressionA'][number]['properties']['spaceB']['externalIdC/v1'];
    type QueryPropertiesC =
      (typeof testQuery.select.resultExpressionA.sources)[2]['properties'][number];

    type Assert2 = Expect<Equal<ResultPropertiesC, QueryPropertiesC>>;
    // @ts-ignore
    type _2 = Assert2;
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
      }
    ];

    type TypedResultProperties = Awaited<ReturnType<
      typeof CogniteClient.prototype.instances.query<typeof testQuery, SourceExternalIdAPropertyTypes>
    >>['items']['resultExpressionA'][number]['properties']['spaceA']['externalIdA/v1'];

    type Assert = Expect<Equal<TypedResultProperties, SourceExternalIdAPropertyTypes[0]['properties']>>;
    // @ts-ignore
    type _ = Assert;
  });

  test('Passing a non-constant query should be valid', () => {
    type QueryResult = Awaited<ReturnType<typeof CogniteClient.prototype.instances.query<QueryRequest>>>;

    type TestType = QueryResult extends {
      items: Record<string, any>;
      nextCursors?: Record<string, any>;
    }
      ? true
      : false;

    type Assert = Expect<Equal<TestType, true>>;
    // @ts-ignore
    type _ = Assert;
  });

  test('passing * as property should type properties as Record', () => {
    type ResultSourceSpaces = Awaited<ReturnType<
      typeof CogniteClient.prototype.instances.query<typeof testQuery>
    >>['items']['resultExpressionB'][number]['properties']['spaceD']['externalIdD/v1'];

    // @ts-expect-error - property key should not be the string '*'
    type _ = Expect<Equal<ResultSourceSpaces, '*'>>;

    type Assert = Expect<Equal<ResultSourceSpaces, Record<string, unknown>>>;
    // @ts-ignore
    type _1 = Assert;
  });
});

const testQuery = {
  with: {
    resultExpressionA: {
      nodes: {}
    },
    resultExpressionB: {
      nodes: {}
    },
    resultExpressionC: {
      edges: {}
    }
  },
  select: {
    resultExpressionA: {
      sources: [
        {
          source: {
            type: 'view',
            space: 'spaceA',
            externalId: 'externalIdA',
            version: 'v1'
          },
          properties: ['aPropOne', 'aPropTwo', 'aPropThree']
        },
        {
          source: {
            type: 'view',
            space: 'spaceA',
            externalId: 'externalIdB',
            version: 'v1'
          },
          properties: ['bPropOne', 'bPropTwo']
        },
        {
          source: {
            type: 'view',
            space: 'spaceB',
            externalId: 'externalIdC',
            version: 'v1'
          },
          properties: ['cPropOne']
        }
      ]
    },
    resultExpressionB: {
      sources: [
        {
          source: {
            type: 'view',
            space: 'spaceD',
            externalId: 'externalIdD',
            version: 'v1'
          },
          properties: ['*']
        }
      ]
    },
    resultExpressionC: {
      sources: [
        {
          source: {
            type: 'view',
            space: 'spaceE',
            externalId: 'externalIdE',
            version: 'v1'
          },
          properties: ['ePropOne', 'ePropTwo']
        }
      ]
    }
  }
} as const satisfies QueryRequest;
