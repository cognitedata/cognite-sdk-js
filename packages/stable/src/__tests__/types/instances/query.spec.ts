// Copyright 2025 Cognite AS

import { describe, expectTypeOf, test } from 'vitest';
import type { InstancesAPI } from '../../../api/instances/instancesApi';
import type {
  EdgeDefinition,
  NodeDefinition,
  NodeOrEdge,
  PropertyValueGroupV3,
  QueryRequest,
  QueryResponse,
  QueryResult,
  QuerySelectV3,
  RawPropertyValueV3,
} from '../../../types';

// These tests only hold at the type level. They are enforced by `tsc` when the
// package is built, since this file lives under `src/`.

type Query = InstancesAPI['query'];
type ResultOf<TRequest extends QueryRequest> = Awaited<
  ReturnType<typeof InstancesAPI.prototype.query<TRequest>>
>;

/** An empty object type, as in `select: { alias: {} }`. */
type Empty = Record<never, never>;

/** Strips string index signatures so that `keyof` lists only the known keys. */
type KnownKeys<T> = {
  [K in keyof T as string extends K
    ? never
    : number extends K
      ? never
      : K]: T[K];
};

const view = {
  type: 'view',
  space: 'spaceA',
  externalId: 'ViewA',
  version: 'v1',
} as const;

const constQuery = {
  with: {
    nodesA: { nodes: {}, limit: 10 },
    edgesB: { edges: {} },
  },
  select: {
    nodesA: {
      sources: [
        { source: view, properties: ['propOne', 'propTwo'] },
        {
          source: {
            type: 'view',
            space: 'spaceA',
            externalId: 'ViewB',
            version: 'v2',
          },
          properties: ['propThree'],
        },
        {
          source: {
            type: 'view',
            space: 'spaceB',
            externalId: 'ViewC',
            version: 'v1',
          },
          properties: ['*'],
        },
      ],
    },
    edgesB: {},
  },
} as const satisfies QueryRequest;

type ConstResult = ResultOf<typeof constQuery>;
type NodesAItem = ConstResult['items']['nodesA'][number];

describe('instances.query response types', () => {
  test('a request typed as QueryRequest gives the untyped QueryResponse', () => {
    expectTypeOf<Awaited<ReturnType<Query>>>().toEqualTypeOf<QueryResponse>();
    expectTypeOf<ResultOf<QueryRequest>>().toEqualTypeOf<QueryResponse>();
    expectTypeOf<QueryResult<QueryRequest>>().toEqualTypeOf<QueryResponse>();
  });

  test('items has one array per select key', () => {
    expectTypeOf<keyof KnownKeys<ConstResult['items']>>().toEqualTypeOf<
      'nodesA' | 'edgesB'
    >();
  });

  test('a nodes expression gives nodes and an edges expression gives edges', () => {
    expectTypeOf<NodesAItem['instanceType']>().toEqualTypeOf<'node'>();
    expectTypeOf<
      ConstResult['items']['edgesB'][number]['instanceType']
    >().toEqualTypeOf<'edge'>();
    expectTypeOf<
      ConstResult['items']['edgesB'][number]['startNode']
    >().toEqualTypeOf<EdgeDefinition['startNode']>();
  });

  test('properties are nested by space, then by externalId/version of the view', () => {
    expectTypeOf<keyof KnownKeys<NodesAItem['properties']>>().toEqualTypeOf<
      'spaceA' | 'spaceB'
    >();
    expectTypeOf<
      keyof KnownKeys<NodesAItem['properties']['spaceA']>
    >().toEqualTypeOf<'ViewA/v1' | 'ViewB/v2'>();
    expectTypeOf<
      keyof KnownKeys<NodesAItem['properties']['spaceA']['ViewA/v1']>
    >().toEqualTypeOf<'propOne' | 'propTwo'>();
    expectTypeOf<
      keyof KnownKeys<NodesAItem['properties']['spaceA']['ViewB/v2']>
    >().toEqualTypeOf<'propThree'>();
  });

  test('a selected property is RawPropertyValueV3 unless typed sources are given', () => {
    expectTypeOf<
      NodesAItem['properties']['spaceA']['ViewA/v1']['propOne']
    >().toEqualTypeOf<RawPropertyValueV3>();
  });

  test('selecting * gives the untyped property group', () => {
    expectTypeOf<
      NodesAItem['properties']['spaceB']['ViewC/v1']
    >().toEqualTypeOf<PropertyValueGroupV3>();
  });

  test('a select entry without sources gives the plain definition', () => {
    expectTypeOf<
      ConstResult['items']['edgesB'][number]
    >().toEqualTypeOf<EdgeDefinition>();
  });

  test('nextCursor is keyed like with, and each cursor may be absent', () => {
    expectTypeOf<ConstResult['nextCursor']['nodesA']>().toEqualTypeOf<
      string | undefined
    >();
    expectTypeOf<ConstResult['nextCursor'][string]>().toEqualTypeOf<string>();
  });

  test('indexing with a runtime string keeps compiling, with the wide types', () => {
    expectTypeOf<ConstResult['items'][string]>().toEqualTypeOf<NodeOrEdge[]>();
    expectTypeOf<NodesAItem['properties'][string]>().toEqualTypeOf<
      Record<string, PropertyValueGroupV3>
    >();
    expectTypeOf<
      NodesAItem['properties']['spaceA'][string]
    >().toEqualTypeOf<PropertyValueGroupV3>();
    expectTypeOf<
      NodesAItem['properties']['spaceA']['ViewA/v1'][string]
    >().toEqualTypeOf<RawPropertyValueV3>();
  });

  test('a typed result is still assignable to QueryResponse', () => {
    expectTypeOf<ConstResult>().toMatchTypeOf<QueryResponse>();
  });

  test('typed sources replace RawPropertyValueV3 for the listed view only', () => {
    type Typed = Awaited<
      ReturnType<
        typeof InstancesAPI.prototype.query<
          typeof constQuery,
          [
            {
              source: typeof view;
              properties: { propOne: string; propTwo: number[] };
            },
          ]
        >
      >
    >;
    type Props = Typed['items']['nodesA'][number]['properties']['spaceA'];
    expectTypeOf<Props['ViewA/v1']['propOne']>().toEqualTypeOf<string>();
    expectTypeOf<Props['ViewA/v1']['propTwo']>().toEqualTypeOf<number[]>();
    expectTypeOf<
      Props['ViewB/v2']['propThree']
    >().toEqualTypeOf<RawPropertyValueV3>();
  });
});

describe('instances.query response types for requests built at runtime', () => {
  test('an inline literal infers keys and kind but keeps spaces, views and properties wide', () => {
    type Result = ResultOf<{
      with: { rs: { nodes: { filter: { hasData: [] } } } };
      select: {
        rs: {
          sources: {
            source: {
              type: 'view';
              space: string;
              externalId: string;
              version: string;
            };
            properties: string[];
          }[];
        };
      };
    }>;
    type Item = Result['items']['rs'][number];
    expectTypeOf<Item['instanceType']>().toEqualTypeOf<'node'>();
    expectTypeOf<
      Item['properties'][string][string]
    >().toEqualTypeOf<PropertyValueGroupV3>();
    expectTypeOf<Result>().toMatchTypeOf<QueryResponse>();
  });

  test('a select built as a Record stays wide and assignable to QueryResponse', () => {
    type Result = ResultOf<{
      with: { rs: { nodes: Empty } };
      select: Record<string, QuerySelectV3>;
    }>;
    expectTypeOf<Result['items'][string]>().toMatchTypeOf<NodeOrEdge[]>();
    expectTypeOf<Result>().toMatchTypeOf<QueryResponse>();
  });

  test('a result set that is only conditionally selected is optional', () => {
    type Result = ResultOf<{
      with: { a: { nodes: Empty }; b: { edges: Empty } };
      select: { a: Empty; b?: Empty };
    }>;
    expectTypeOf<Result['items']['a']>().toEqualTypeOf<NodeDefinition[]>();
    expectTypeOf<Result['items']['b']>().toEqualTypeOf<
      EdgeDefinition[] | undefined
    >();
    expectTypeOf<Result>().toMatchTypeOf<QueryResponse>();
  });

  test('properties is optional when sources is optional in the request', () => {
    type Result = ResultOf<{
      with: { a: { nodes: Empty } };
      select: {
        a: { sources?: [{ source: typeof view; properties: ['propOne'] }] };
      };
    }>;
    type Props = Result['items']['a'][number]['properties'];
    expectTypeOf<undefined>().toMatchTypeOf<Props>();
    expectTypeOf<
      NonNullable<Props>['spaceA']['ViewA/v1']['propOne']
    >().toEqualTypeOf<RawPropertyValueV3>();
  });

  test('a widened property list makes every property optional', () => {
    type Result = ResultOf<{
      with: { a: { nodes: Empty } };
      select: {
        a: {
          sources: [
            { source: typeof view; properties: ('propOne' | 'propTwo')[] },
          ];
        };
      };
    }>;
    type Props =
      Result['items']['a'][number]['properties']['spaceA']['ViewA/v1'];
    expectTypeOf<KnownKeys<Props>>().toEqualTypeOf<{
      propOne?: RawPropertyValueV3;
      propTwo?: RawPropertyValueV3;
    }>();
  });

  test('a union of a nodes and an edges expression gives a union of definitions', () => {
    type Result = ResultOf<{
      with: { x: { nodes: Empty } | { edges: Empty } };
      select: { x: Empty };
    }>;
    expectTypeOf<Result['items']['x'][number]>().toEqualTypeOf<
      NodeDefinition | EdgeDefinition
    >();
  });

  test('a set operation gives NodeOrEdge', () => {
    type Result = ResultOf<{
      with: { a: { nodes: Empty }; u: { unionAll: ['a'] } };
      select: { u: Empty };
    }>;
    expectTypeOf<Result['items']['u'][number]>().toEqualTypeOf<NodeOrEdge>();
  });
});
