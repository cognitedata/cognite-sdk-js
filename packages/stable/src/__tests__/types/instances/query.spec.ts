/*!
 * Copyright 2024 Cognite AS
 */

import { describe, expectTypeOf, test } from 'vitest';
import type { InstancesAPI } from '../../../api/instances/instancesApi';
import type {
  EdgeDefinition,
  NodeDefinition,
  QueryRequest,
  RawPropertyValueV3,
} from '../../../types';
import type { SelectSourceWithParams } from '../../../api/instances/query.types';

// ---------------------------------------------------------------------------
// Shared query fixture
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Original tests (unchanged)
// ---------------------------------------------------------------------------

describe('queryNodesEdges type tests', () => {
  test('query result keys should match const query select keys', () => {
    type QueryResultSelectKeys = keyof Awaited<
      ReturnType<typeof InstancesAPI.prototype.queryTyped<typeof testQuery>>
    >['items'];

    expectTypeOf<QueryResultSelectKeys>().toEqualTypeOf<
      keyof typeof testQuery.select
    >();
  });

  test('Each source with unique space should map to a key in properties of result', () => {
    type ResultSourceSpaces = keyof NonNullable<
      Awaited<
        ReturnType<typeof InstancesAPI.prototype.queryTyped<typeof testQuery>>
      >['items']['resultExpressionA'][number]['properties']
    >;

    type QueryResultSpaces =
      (typeof testQuery.select.resultExpressionA.sources)[number]['source']['space'];
    expectTypeOf<ResultSourceSpaces>().toEqualTypeOf<QueryResultSpaces>();
  });

  test('property keys of result should match property keys of sources', () => {
    type ResultPropertiesA = keyof NonNullable<
      Awaited<
        ReturnType<typeof InstancesAPI.prototype.queryTyped<typeof testQuery>>
      >['items']['resultExpressionA'][number]['properties']
    >['spaceA']['externalIdA/v1'];
    type QueryPropertiesA =
      (typeof testQuery.select.resultExpressionA.sources)[0]['properties'][number];

    expectTypeOf<ResultPropertiesA>().toEqualTypeOf<QueryPropertiesA>();

    type ResultPropertiesB = keyof NonNullable<
      Awaited<
        ReturnType<typeof InstancesAPI.prototype.queryTyped<typeof testQuery>>
      >['items']['resultExpressionA'][number]['properties']
    >['spaceA']['externalIdB/v1'];
    type QueryPropertiesB =
      (typeof testQuery.select.resultExpressionA.sources)[1]['properties'][number];

    expectTypeOf<ResultPropertiesB>().toEqualTypeOf<QueryPropertiesB>();

    type ResultPropertiesC = keyof NonNullable<
      Awaited<
        ReturnType<typeof InstancesAPI.prototype.queryTyped<typeof testQuery>>
      >['items']['resultExpressionA'][number]['properties']
    >['spaceB']['externalIdC/v1'];
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

    type TypedResultProperties = NonNullable<
      Awaited<
        ReturnType<
          typeof InstancesAPI.prototype.queryTyped<
            typeof testQuery,
            SourceExternalIdAPropertyTypes
          >
        >
      >['items']['resultExpressionA'][number]['properties']
    >['spaceA']['externalIdA/v1'];

    expectTypeOf<TypedResultProperties>().toEqualTypeOf<
      SourceExternalIdAPropertyTypes[0]['properties']
    >();
  });

  test('Passing a non-constant query should be valid', () => {
    /**
     * `QueryResult<QueryRequest>` is intentionally more specific than
     * `QueryResponse`:
     *
     * - `nextCursor` values are `string | undefined` (defect 4 fix) whereas
     *   `QueryResponse.nextCursor` is `Record<string, string>`.
     * - `properties` on each item is optional (defect 3 fix).
     *
     * The test below verifies that the type is well-formed and that the
     * `items` record has the correct key type when used with a non-constant
     * query (string index signature).
     */
    type QueryResultType = Awaited<
      ReturnType<typeof InstancesAPI.prototype.queryTyped<QueryRequest>>
    >;

    // items should be a Record-like type (string keys)
    type ItemKeys = keyof QueryResultType['items'];
    expectTypeOf<ItemKeys>().toEqualTypeOf<string>();

    // nextCursor should have string | undefined values (not plain string)
    type CursorValue = QueryResultType['nextCursor'][string];
    expectTypeOf<CursorValue>().toEqualTypeOf<string | undefined>();

    // The result should have the expected top-level shape
    expectTypeOf<QueryResultType>().toHaveProperty('items');
    expectTypeOf<QueryResultType>().toHaveProperty('nextCursor');
  });

  test('passing * as property should type properties as Record', () => {
    type ResultSourceSpaces = NonNullable<
      Awaited<
        ReturnType<typeof InstancesAPI.prototype.queryTyped<typeof testQuery>>
      >['items']['resultExpressionB'][number]['properties']
    >['spaceD']['externalIdD/v1'];

    expectTypeOf<ResultSourceSpaces>().toEqualTypeOf<
      Record<string, RawPropertyValueV3>
    >();
  });
});

// ---------------------------------------------------------------------------
// Regression tests for the five defects identified in cognitedata/dune#828
// ---------------------------------------------------------------------------

describe('queryTyped defect regression tests', () => {
  // -------------------------------------------------------------------------
  // Defect 1: Non-distributive Omit collapses NodeOrEdge discriminated union
  // -------------------------------------------------------------------------

  test('[defect 1] node result item is assignable to NodeDefinition (minus properties)', () => {
    type NodeItem = Awaited<
      ReturnType<typeof InstancesAPI.prototype.queryTyped<typeof testQuery>>
    >['items']['resultExpressionA'][number];

    // Before the fix, the mixed branch used Omit<NodeOrEdge, 'properties'>,
    // which collapses to { instanceType: 'node' | 'edge' } with no
    // startNode/endNode, making this assignability fail.
    // The fix (`OmitDistributive`) is only needed for the mixed branch, but
    // this test ensures node/edge branches also produce assignable types.
    expectTypeOf<NodeItem>().toMatchTypeOf<Omit<NodeDefinition, 'properties'>>();
  });

  test('[defect 1] edge result item is assignable to EdgeDefinition (minus properties)', () => {
    type EdgeItem = Awaited<
      ReturnType<typeof InstancesAPI.prototype.queryTyped<typeof testQuery>>
    >['items']['resultExpressionC'][number];

    expectTypeOf<EdgeItem>().toMatchTypeOf<Omit<EdgeDefinition, 'properties'>>();
  });

  test('[defect 1] mixed result item (union branch) preserves discriminated union', () => {
    // A set-operation expression (intersection/union) lands in the third branch
    // of DmsInstanceType, which previously returned Omit<NodeOrEdge, ...> —
    // a non-distributive omit that collapses startNode/endNode away.
    // With OmitDistributive, both members are omitted separately.
    const mixedQuery = {
      with: {
        merged: {
          intersection: ['resultExpressionA', 'resultExpressionC'],
        },
      },
      select: {
        merged: {
          sources: [
            {
              source: {
                type: 'view',
                space: 'spaceA',
                externalId: 'externalIdA',
                version: 'v1',
              },
              properties: ['aPropOne'],
            },
          ],
        },
      },
    } as const satisfies QueryRequest;

    type MixedItem = Awaited<
      ReturnType<typeof InstancesAPI.prototype.queryTyped<typeof mixedQuery>>
    >['items']['merged'][number];

    // The item type should be a union (distributive), not a collapsed single type.
    // OmitDistributive<NodeOrEdge, 'properties'> =
    //   Omit<NodeDefinition, 'properties'> | Omit<EdgeDefinition, 'properties'>
    // Both members of NodeOrEdge (minus properties) should be assignable to MixedItem.
    expectTypeOf<Omit<NodeDefinition, 'properties'>>().toMatchTypeOf<MixedItem>();
    expectTypeOf<Omit<EdgeDefinition, 'properties'>>().toMatchTypeOf<MixedItem>();

    // And MixedItem should NOT collapse instanceType to 'node' | 'edge' on a
    // single object — narrowing by instanceType should still work.
    type NodeBranch = Extract<MixedItem, { instanceType: 'node' }>;
    type EdgeBranch = Extract<MixedItem, { instanceType: 'edge' }>;

    expectTypeOf<NodeBranch>().not.toEqualTypeOf<never>();
    expectTypeOf<EdgeBranch>().not.toEqualTypeOf<never>();
  });

  // -------------------------------------------------------------------------
  // Defect 2: Sort clause on a node expression changes item type to mixed
  // -------------------------------------------------------------------------

  test('[defect 2] node expression with sort clause still infers instanceType as "node"', () => {
    const queryWithSort = {
      with: {
        items: {
          nodes: {},
          sort: [{ property: ['spaceA', 'externalIdA/v1', 'name'] }],
        },
      },
      select: {
        items: {
          sources: [
            {
              source: {
                type: 'view',
                space: 'spaceA',
                externalId: 'externalIdA',
                version: 'v1',
              },
              properties: ['name'],
            },
          ],
        },
      },
    } as const satisfies QueryRequest;

    type Item = Awaited<
      ReturnType<typeof InstancesAPI.prototype.queryTyped<typeof queryWithSort>>
    >['items']['items'][number];

    // Before the fix, `Exclude<keyof { nodes: {}; sort: [...] }, 'limit'>` =
    // `'nodes' | 'sort'`, which does not extend `'nodes'`, so the item fell
    // back to `Omit<NodeOrEdge, 'properties'>` and instanceType became
    // `'node' | 'edge'`. The fix uses `NODES extends keyof`, which is stable
    // against sibling keys.
    expectTypeOf<Item['instanceType']>().toEqualTypeOf<'node'>();
  });

  test('[defect 2] edge expression with sort and postSort still infers instanceType as "edge"', () => {
    const queryWithEdgeSort = {
      with: {
        connections: {
          edges: {},
          sort: [{ property: ['spaceA', 'externalIdA/v1', 'weight'] }],
          postSort: [{ property: ['spaceA', 'externalIdA/v1', 'weight'] }],
        },
      },
      select: {
        connections: {
          sources: [
            {
              source: {
                type: 'view',
                space: 'spaceA',
                externalId: 'externalIdA',
                version: 'v1',
              },
              properties: ['weight'],
            },
          ],
        },
      },
    } as const satisfies QueryRequest;

    type Item = Awaited<
      ReturnType<typeof InstancesAPI.prototype.queryTyped<typeof queryWithEdgeSort>>
    >['items']['connections'][number];

    expectTypeOf<Item['instanceType']>().toEqualTypeOf<'edge'>();
  });

  // -------------------------------------------------------------------------
  // Defect 3: properties required but absent for empty source lists
  // -------------------------------------------------------------------------

  test('[defect 3] expression with sources:[] has optional properties', () => {
    const queryWithEmptySources = {
      with: {
        edgeTraversal: {
          edges: {},
        },
      },
      select: {
        edgeTraversal: {
          sources: [],
        },
      },
    } as const satisfies QueryRequest;

    type EdgeItem = Awaited<
      ReturnType<
        typeof InstancesAPI.prototype.queryTyped<typeof queryWithEmptySources>
      >
    >['items']['edgeTraversal'][number];

    // properties should be optional — `undefined` must be assignable to it.
    // Before the fix, properties was required, so this type check would fail.
    type PropertiesIsOptional = undefined extends EdgeItem['properties']
      ? true
      : false;
    expectTypeOf<PropertiesIsOptional>().toEqualTypeOf<true>();
  });

  // -------------------------------------------------------------------------
  // Defect 4: nextCursor optionality lost for non-literal select keys
  // -------------------------------------------------------------------------

  test('[defect 4] nextCursor values are string | undefined for literal keys', () => {
    type CursorA = Awaited<
      ReturnType<typeof InstancesAPI.prototype.queryTyped<typeof testQuery>>
    >['nextCursor']['resultExpressionA'];

    // Cursor must be string | undefined (present = string, absent = undefined).
    // Before the fix, ConcreteValues stripped undefined, giving just `string`.
    expectTypeOf<CursorA>().toEqualTypeOf<string | undefined>();
  });

  test('[defect 4] nextCursor values are string | undefined for non-literal (computed) query', () => {
    type GenericResult = Awaited<
      ReturnType<typeof InstancesAPI.prototype.queryTyped<QueryRequest>>
    >;
    type CursorValue = GenericResult['nextCursor'][string];

    // For a non-constant query, select keys are `string` (index signature).
    // Before the fix, ConcreteValues collapsed the index signature to
    // `{ [key: string]: string }`, making undefined guards appear redundant.
    expectTypeOf<CursorValue>().toEqualTypeOf<string | undefined>();
  });

  // -------------------------------------------------------------------------
  // Defect 5: SelectSourceWithParams rejects interface types and nullable values
  // -------------------------------------------------------------------------

  test('[defect 5] SelectSourceWithParams accepts interface properties', () => {
    interface WorkOrderProperties {
      name: string;
      description: string | null; // nullable — rejected by old RawPropertyValueV3 constraint
      priority: number;
    }

    // Before the fix, `Record<string, RawPropertyValueV3>` rejects both
    // an interface (no implicit index signature) and `string | null` (null
    // not in RawPropertyValueV3). The new `properties: unknown` accepts both.
    type TypedSources = [
      {
        source: {
          type: 'view';
          space: 'mySpace';
          externalId: 'WorkOrder';
          version: 'v1';
        };
        properties: WorkOrderProperties; // interface with nullable property
      },
    ];

    type IsValid = TypedSources extends SelectSourceWithParams ? true : false;
    expectTypeOf<IsValid>().toEqualTypeOf<true>();
  });

  test('[defect 5] typed query result uses interface property types including nullable', () => {
    interface WorkOrderProperties {
      name: string;
      description: string | null;
      priority: number;
    }

    type TypedSources = [
      {
        source: {
          type: 'view';
          space: 'mySpace';
          externalId: 'WorkOrder';
          version: 'v1';
        };
        properties: WorkOrderProperties;
      },
    ];

    const workOrderQuery = {
      with: { workOrders: { nodes: {} } },
      select: {
        workOrders: {
          sources: [
            {
              source: {
                type: 'view',
                space: 'mySpace',
                externalId: 'WorkOrder',
                version: 'v1',
              },
              properties: ['name', 'description', 'priority'],
            },
          ],
        },
      },
    } as const satisfies QueryRequest;

    type Props = NonNullable<
      Awaited<
        ReturnType<
          typeof InstancesAPI.prototype.queryTyped<
            typeof workOrderQuery,
            TypedSources
          >
        >
      >['items']['workOrders'][number]['properties']
    >['mySpace']['WorkOrder/v1'];

    // All three properties should resolve to their typed values, including
    // the nullable `description`.
    expectTypeOf<Props['name']>().toEqualTypeOf<string>();
    expectTypeOf<Props['description']>().toEqualTypeOf<string | null>();
    expectTypeOf<Props['priority']>().toEqualTypeOf<number>();
  });

  test('[defect 5] type alias properties continue to work as before', () => {
    type WorkOrderType = {
      name: string;
      status: 'open' | 'closed';
    };

    type TypedSources = [
      {
        source: {
          type: 'view';
          space: 'mySpace';
          externalId: 'WorkOrder';
          version: 'v1';
        };
        properties: WorkOrderType;
      },
    ];

    type IsValid = TypedSources extends SelectSourceWithParams ? true : false;
    expectTypeOf<IsValid>().toEqualTypeOf<true>();
  });
});
