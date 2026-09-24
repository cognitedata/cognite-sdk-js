import type {
  EdgeDefinition,
  NodeDefinition,
  NodeOrEdge,
  QueryRequest,
  RawPropertyValueV3,
  TypeInformationOuter,
  ViewReference,
} from './types.gen';

export type SelectSourceWithParams = Array<{
  source: ViewReference;
  properties: Record<string, RawPropertyValueV3>;
}>;

type SELECT = 'select';
type WITH = 'with';
type LIMIT = 'limit';
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
          properties: {
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
   */
  nextCursor: Prettify<
    ConcreteValues<{
      [SelectKey in keyof TQueryRequest[SELECT]]?: string;
    }>
  >;
  /** Optional type information for property values, keyed by view identifier. */
  typing?: Record<string, TypeInformationOuter>;
};

type DmsInstanceType<
  TQueryRequest extends QueryRequest,
  SelectKey extends keyof TQueryRequest[SELECT],
> = Exclude<keyof TQueryRequest[WITH][SelectKey], LIMIT> extends NODES
  ? Omit<NodeDefinition, PROPERTIES>
  : Exclude<keyof TQueryRequest[WITH][SelectKey], LIMIT> extends EDGES
    ? Omit<EdgeDefinition, PROPERTIES>
    : Omit<NodeOrEdge, PROPERTIES>;

type TypedSourceProperty<
  SelectSource extends NonNullable<
    QueryRequest[SELECT][keyof QueryRequest[SELECT]][SOURCES]
  >[number],
  TypedSelectSourcePropertyMap extends
    SelectSourceWithParams = SelectSourceWithParams,
> = Extract<
  TypedSelectSourcePropertyMap[number],
  Pick<SelectSource, SOURCE>
>[PROPERTIES];

type ConcreteValues<T> = {
  [K in keyof T]: NonNullable<T[K]>;
};

type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};
