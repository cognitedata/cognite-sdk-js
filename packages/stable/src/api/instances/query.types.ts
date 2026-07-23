import type {
  EdgeDefinition,
  NodeDefinition,
  NodeOrEdge,
  QueryRequest,
  RawPropertyValueV3,
  TypeInformationOuter,
  ViewReference,
} from './types.gen';

/**
 * An array of view-source descriptors with typed property maps, passed as the
 * second type argument of `queryTyped` to replace the default
 * `RawPropertyValueV3` property types with concrete ones from a data model.
 *
 * **Fix for defect 5**: `properties` accepts any object shape — including
 * `interface` declarations and properties whose values include `null` — rather
 * than being restricted to `Record<string, RawPropertyValueV3>`. The previous
 * constraint rejected both: interfaces (which lack an implicit index signature
 * in TypeScript) and nullable property values (`string | null` is not
 * assignable to `RawPropertyValueV3`), blocking code-generation output from
 * being passed here.
 */
export type SelectSourceWithParams = Array<{
  source: ViewReference;
  /**
   * Property types for this view source. Accepts any object shape including
   * `interface` declarations and properties typed with `null`.
   *
   * When a view's source is matched during type extraction, the concrete
   * property types from this field are used in the result. The default
   * `SelectSourceWithParams` carries a generic `ViewReference` source that
   * never matches a literal query source, so omitting this type argument
   * falls back to `RawPropertyValueV3` for every property.
   */
  properties: unknown;
}>;

type SELECT = 'select';
type WITH = 'with';
type NODES = 'nodes';
type EDGES = 'edges';
type PROPERTIES = 'properties';
type SOURCES = 'sources';
type SOURCE = 'source';
type SPACE = 'space';
type EXTERNALID = 'externalId';
type VERSION = 'version';
type ALLPROPERTIES = '*';

/**
 * Typed result of a DMS instances query, derived from the query request shape.
 *
 * `items` is keyed by the result-set names defined in the `select` clause of
 * `TQueryRequest`. Each result set is an array of node or edge objects whose
 * `properties` are nested first by space, then by `externalId/version` of the
 * view. Property value types are inferred from `TSelectSourceWithParams` when
 * provided, falling back to the raw `RawPropertyValueV3` union otherwise.
 *
 * @typeParam TQueryRequest - The query request object whose `select` and `with`
 *   clauses drive the shape of the returned items and cursors.
 * @typeParam TSelectSourceWithParams - An optional mapping of view references to
 *   typed property records. When supplied, properties listed in the `select`
 *   clause are narrowed to their concrete types instead of `RawPropertyValueV3`.
 *   Defaults to the untyped `SelectSourceWithParams`.
 *
 * @example
 * ```ts
 * const result: QueryResult<typeof myQuery> = await client.instances.queryTyped(myQuery);
 * // result.items.<resultSetName>[0].properties.<space>.<externalId/version>.<propertyName>
 * ```
 */
export type QueryResult<
  TQueryRequest extends QueryRequest,
  TSelectSourceWithParams extends
    SelectSourceWithParams = SelectSourceWithParams,
> = {
  /** Result sets keyed by the names defined in the query's `select` clause. */
  items: {
    [SelectKey in keyof TQueryRequest[SELECT]]: Array<
      Prettify<
        DmsInstanceType<TQueryRequest, SelectKey> & {
          /**
           * Fix for defect 3: `properties` is optional.
           *
           * A select entry with `sources: []` returns items with no
           * `properties` member — for example, edge expressions traversed
           * only to reach their target node. The previous required field
           * produced a type error for objects that legitimately lack
           * properties.
           */
          properties?: {
            [SelectSource in NonNullable<
              NonNullable<TQueryRequest[SELECT][SelectKey]>[SOURCES]
            >[number] as SelectSource[SOURCE][SPACE]]: {
              [SelectSourceVar in SelectSource as `${SelectSourceVar[SOURCE][EXTERNALID]}/${SelectSourceVar[SOURCE][VERSION]}`]: SelectSourceVar[PROPERTIES][0] extends ALLPROPERTIES
                ? Record<string, RawPropertyValueV3>
                : {
                    [SELECT_SOURCE_PROPERTY in SelectSourceVar[PROPERTIES][number]]: TypedSourceProperty<
                      SelectSourceVar,
                      TSelectSourceWithParams
                    >[SELECT_SOURCE_PROPERTY] extends never
                      ? RawPropertyValueV3
                      : TypedSourceProperty<
                          SelectSourceVar,
                          TSelectSourceWithParams
                        >[SELECT_SOURCE_PROPERTY];
                  };
            };
          };
        }
      >
    >;
  };
  /**
   * Pagination cursors, one per result set. Pass these back in a subsequent
   * request to retrieve the next page for any result set that has more items.
   *
   * **Fix for defect 4**: cursor values are `string | undefined` rather than
   * `string`. The previous `ConcreteValues` wrapper stripped `undefined` from
   * value types while relying on the `?` optional modifier to communicate
   * "may be absent". For computed (non-literal) select keys the mapped type
   * applied to an index signature, the optional modifier was not preserved,
   * and indexed access resolved to `string` — making correct `undefined`
   * guards appear redundant and hiding the fact that an exhausted result set
   * carries no cursor.
   */
  nextCursor: Prettify<{
    [SelectKey in keyof TQueryRequest[SELECT]]?: string;
  }>;
  /** Optional type information for property values, keyed by view identifier. */
  typing?: Record<string, TypeInformationOuter>;
};

/**
 * Fix for defect 1: distributive Omit that preserves the discriminated union.
 *
 * The built-in `Omit<NodeOrEdge, 'properties'>` is not distributive over
 * unions: it intersects all members first, then applies Omit, collapsing
 * `NodeDefinition | EdgeDefinition` into a single object type with
 * `instanceType: 'node' | 'edge'` and no `startNode`/`endNode`. This makes
 * the result not assignable to `NodeOrEdge` and breaks narrowing by
 * `instanceType`. Distributing the Omit over each union member preserves
 * both members independently.
 */
type OmitDistributive<T, K extends keyof any> = T extends unknown
  ? Omit<T, K>
  : never;

/**
 * Resolve the base instance type (node, edge, or mixed) for a result-set
 * expression, stripping the `properties` key that `QueryResult` re-types.
 *
 * **Fix for defect 2**: the check is now `NODES extends keyof ...` instead of
 * `Exclude<keyof ..., LIMIT> extends NODES`. The previous formulation
 * enumerated all keys of the `with` expression excluding `limit` and tested
 * whether the result equalled `'nodes'`. Any optional sibling key — in
 * particular `sort`, which `QueryNodeTableExpressionV3` carries — expands the
 * union to `'nodes' | 'sort'`, which fails the `extends 'nodes'` test and
 * falls through to the mixed branch. The new check asks only "is `nodes` a
 * key of this expression?", which is stable against optional siblings.
 */
type DmsInstanceType<
  TQueryRequest extends QueryRequest,
  SelectKey extends keyof TQueryRequest[SELECT],
> = NODES extends keyof TQueryRequest[WITH][SelectKey]
  ? Omit<NodeDefinition, PROPERTIES>
  : EDGES extends keyof TQueryRequest[WITH][SelectKey]
    ? Omit<EdgeDefinition, PROPERTIES>
    : OmitDistributive<NodeOrEdge, PROPERTIES>;

/**
 * Extracts the typed property map for a given `SelectSource` from the
 * caller-supplied `TypedSelectSourcePropertyMap`.
 *
 * The result is intersected with `Record<string, unknown>` to make it
 * indexable by the property name literals in the `select` clause, even when
 * the user-supplied properties type is an `interface` (which lacks an implicit
 * index signature in TypeScript). Known property types are preserved because
 * `T & Record<string, unknown>` resolves known keys to their concrete types
 * while adding an index signature for unknown keys.
 *
 * When no matching source is found in `TypedSelectSourcePropertyMap` the
 * conditional resolves to `never`, and the caller falls back to
 * `RawPropertyValueV3`.
 */
type TypedSourceProperty<
  SelectSource extends NonNullable<
    QueryRequest[SELECT][keyof QueryRequest[SELECT]][SOURCES]
  >[number],
  TypedSelectSourcePropertyMap extends
    SelectSourceWithParams = SelectSourceWithParams,
> = Extract<
  TypedSelectSourcePropertyMap[number],
  Pick<SelectSource, SOURCE>
> extends { [K in PROPERTIES]: infer P }
  ? P & Record<string, unknown>
  : never;

type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};
