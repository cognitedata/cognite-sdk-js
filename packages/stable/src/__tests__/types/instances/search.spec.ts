// Copyright 2025 Cognite AS

import { describe, expectTypeOf, test } from 'vitest';
import type { InstancesAPI } from '../../../api/instances/instancesApi';
import type {
  ByIdsResponse,
  EdgeDefinition,
  NodeDefinition,
  NodeOrEdge,
  NodeOrEdgeSearchRequest,
  PropertyValueGroupV3,
  QueryTypedSources,
  QueryTypedSourcesFromList,
  RawPropertyValueV3,
  SearchRequestInput,
  SearchResult,
  TypedSearch,
} from '../../../types';

// These tests only hold at the type level. They are enforced by `tsc` when the
// package is built, since this file lives under `src/`.

type ResultOf<
  TRequest extends SearchRequestInput,
  TTypedSources extends QueryTypedSources = Record<never, never>,
> = Awaited<
  ReturnType<typeof InstancesAPI.prototype.search<TRequest, TTypedSources>>
>;

const view = {
  type: 'view',
  space: 'spaceA',
  externalId: 'ViewA',
  version: 'v1',
} as const;

const nodeRequest = {
  view,
  instanceType: 'node',
  query: 'hello',
  properties: ['title'],
} as const satisfies SearchRequestInput;

describe('instances.search result type', () => {
  test('a plain request type, or no type argument, gives ByIdsResponse', () => {
    expectTypeOf<
      ResultOf<NodeOrEdgeSearchRequest>
    >().toEqualTypeOf<ByIdsResponse>();
    expectTypeOf<
      SearchResult<NodeOrEdgeSearchRequest>
    >().toEqualTypeOf<ByIdsResponse>();
    expectTypeOf<InstancesAPI['search']>()
      .parameter(0)
      .toMatchTypeOf<SearchRequestInput>();
  });

  test('a view that is not made of literals gives ByIdsResponse', () => {
    const wide = { view: { ...view, version: 'v1' as string } } as const;
    expectTypeOf<ResultOf<typeof wide>>().toEqualTypeOf<ByIdsResponse>();
  });

  test('a const request types the items and nests properties by space and view', () => {
    type Result = ResultOf<typeof nodeRequest>;
    type Item = Result['items'][number];
    expectTypeOf<Item['instanceType']>().toEqualTypeOf<'node'>();
    expectTypeOf<Item>().toMatchTypeOf<Omit<NodeDefinition, 'properties'>>();
    expectTypeOf<
      NonNullable<Item['properties']>['spaceA']['ViewA/v1']
    >().toMatchTypeOf<PropertyValueGroupV3>();
    expectTypeOf<
      NonNullable<Item['properties']>['spaceA']['ViewA/v1']['anything']
    >().toEqualTypeOf<RawPropertyValueV3>();
  });

  test('the response keeps the other fields of ByIdsResponse', () => {
    type Result = ResultOf<typeof nodeRequest>;
    expectTypeOf<Result['typing']>().toEqualTypeOf<ByIdsResponse['typing']>();
  });

  test('instanceType narrows to nodes or edges, and omitting it keeps both', () => {
    const edgeRequest = { view, instanceType: 'edge' } as const;
    const eitherRequest = { view } as const;
    expectTypeOf<
      ResultOf<typeof edgeRequest>['items'][number]['instanceType']
    >().toEqualTypeOf<'edge'>();
    expectTypeOf<ResultOf<typeof edgeRequest>['items'][number]>().toMatchTypeOf<
      Omit<EdgeDefinition, 'properties'>
    >();
    expectTypeOf<
      ResultOf<typeof eitherRequest>['items'][number]['instanceType']
    >().toEqualTypeOf<NodeOrEdge['instanceType']>();
  });

  test('properties selects what is searched, not what is returned', () => {
    const otherFields = {
      ...nodeRequest,
      properties: ['description'],
    } as const;
    expectTypeOf<ResultOf<typeof otherFields>>().toEqualTypeOf<
      ResultOf<typeof nodeRequest>
    >();
  });
});

type Model = { 'spaceA/ViewA/v1': { title: string; count: number } };
declare const typedSearch: TypedSearch<Model>;

describe('instances.search with typed sources', () => {
  test('the view in the map gets its property types', () => {
    type Props = NonNullable<
      ResultOf<typeof nodeRequest, Model>['items'][number]['properties']
    >['spaceA']['ViewA/v1'];
    expectTypeOf<Props['title']>().toEqualTypeOf<string>();
    expectTypeOf<Props['count']>().toEqualTypeOf<number>();
    // Other names still index, with the raw type.
    expectTypeOf<Props['other']>().toEqualTypeOf<RawPropertyValueV3>();
  });

  test('a map for another view, or another version, leaves the raw types', () => {
    type Other = { 'spaceA/ViewB/v1': { title: string } };
    type OtherVersion = { 'spaceA/ViewA/v2': { title: string } };
    expectTypeOf<
      NonNullable<
        ResultOf<typeof nodeRequest, Other>['items'][number]['properties']
      >['spaceA']['ViewA/v1']['title']
    >().toEqualTypeOf<RawPropertyValueV3>();
    expectTypeOf<
      NonNullable<
        ResultOf<
          typeof nodeRequest,
          OtherVersion
        >['items'][number]['properties']
      >['spaceA']['ViewA/v1']['title']
    >().toEqualTypeOf<RawPropertyValueV3>();
  });

  test('a property of another view in the map is not applied', () => {
    type Mixed = Model & { 'spaceA/ViewB/v1': { onlyB: boolean } };
    type Props = NonNullable<
      ResultOf<typeof nodeRequest, Mixed>['items'][number]['properties']
    >['spaceA']['ViewA/v1'];
    expectTypeOf<Props['onlyB']>().toEqualTypeOf<RawPropertyValueV3>();
  });

  test('TypedSearch fixes the map and still infers the request', () => {
    type Result = Awaited<ReturnType<typeof typedSearch<typeof nodeRequest>>>;
    expectTypeOf<
      NonNullable<
        Result['items'][number]['properties']
      >['spaceA']['ViewA/v1']['title']
    >().toEqualTypeOf<string>();
  });
});

describe('SearchRequestInput', () => {
  test('accepts a plain request and a readonly one', () => {
    expectTypeOf<NodeOrEdgeSearchRequest>().toMatchTypeOf<SearchRequestInput>();
    expectTypeOf<typeof nodeRequest>().toMatchTypeOf<SearchRequestInput>();
  });

  test('rejects a request that the API does not accept', () => {
    // @ts-expect-error limit must be a number
    const bad = { view, limit: '10' } as const satisfies SearchRequestInput;
    void bad;
    // @ts-expect-error a view is required
    const noView = { query: 'x' } as const satisfies SearchRequestInput;
    void noView;
  });
});

declare const search: InstancesAPI['search'];

describe('instances.search with an inline request', () => {
  // The calls are inside functions that are never run: `search` is only
  // declared here, and `tsc` checks the types of what is inside.
  test('an inline literal is inferred as if it were declared as const', () => {
    const inline = async () => {
      const response = await search({
        view: {
          type: 'view',
          space: 'spaceA',
          externalId: 'ViewA',
          version: 'v1',
        },
        instanceType: 'node',
        query: 'hello',
      });
      type Item = (typeof response)['items'][number];
      expectTypeOf<Item['instanceType']>().toEqualTypeOf<'node'>();
      expectTypeOf<
        NonNullable<Item['properties']>['spaceA']['ViewA/v1']['title']
      >().toEqualTypeOf<RawPropertyValueV3>();
    };
    void inline;
  });

  test('a view that is built at runtime still gives ByIdsResponse', () => {
    const dynamic = async (space: string) => {
      const response = await search({
        view: { type: 'view', space, externalId: 'ViewA', version: 'v1' },
      });
      expectTypeOf(response).toEqualTypeOf<ByIdsResponse>();
    };
    void dynamic;
  });
});

describe('instances.search typed sources from interfaces and lists', () => {
  interface ViewAProps {
    title: string;
    count: number;
  }
  interface ViewBProps {
    onlyB: boolean;
  }

  test('interface property types are accepted in the map', () => {
    type Model = { 'spaceA/ViewA/v1': ViewAProps };
    expectTypeOf<Model>().toMatchTypeOf<QueryTypedSources>();
    type Props = NonNullable<
      ResultOf<typeof nodeRequest, Model>['items'][number]['properties']
    >['spaceA']['ViewA/v1'];
    expectTypeOf<Props['title']>().toEqualTypeOf<string>();
    expectTypeOf<Props['count']>().toEqualTypeOf<number>();
  });

  test('a list of { source, properties } entries is folded into the map', () => {
    // The shape a generator emits per view, such as dune's `ViewPropertyMap`.
    type Model = QueryTypedSourcesFromList<
      [
        { source: typeof view; properties: ViewAProps },
        {
          source: {
            readonly type: 'view';
            readonly space: 'spaceA';
            readonly externalId: 'ViewB';
            readonly version: 'v1';
          };
          properties: ViewBProps;
        },
      ]
    >;
    type PropsA = NonNullable<
      ResultOf<typeof nodeRequest, Model>['items'][number]['properties']
    >['spaceA']['ViewA/v1'];
    expectTypeOf<PropsA['title']>().toEqualTypeOf<string>();
    // The entry for ViewB is not applied to a ViewA request.
    expectTypeOf<PropsA['onlyB']>().toEqualTypeOf<RawPropertyValueV3>();
  });
});
