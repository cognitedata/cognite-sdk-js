// Copyright 2025 Cognite AS

import type {
  EdgeDefinition,
  NextCursorV3,
  NodeDefinition,
  NodeOrEdge,
  PropertyValueGroupV3,
  QueryEdgeTableExpressionV3,
  QueryNodeTableExpressionV3,
  QueryRequest,
  QueryResponse,
  QuerySelectV3,
  QueryTableExpressionV3,
  RawPropertyValueV3,
  SourceSelectorV3,
  TypeInformationOuter,
  ViewOrContainer,
  ViewReference,
} from './types.gen';

/**
 * Optional, caller supplied property value types for {@link QueryResult}.
 *
 * The DMS API does not tell the SDK which TypeScript type a property has, so
 * selected properties are typed as `RawPropertyValueV3` by default. Pass a
 * tuple of `{ source, properties }` entries as the second type argument of
 * `instances.query` to replace that with concrete types for the views you know.
 *
 * ```ts
 * const response = await client.instances.query<
 *   typeof query,
 *   [{ source: typeof view; properties: { title: string; labels: string[] } }]
 * >(query);
 * ```
 */
export type QueryTypedSources = ReadonlyArray<{
  source: ViewReference;
  properties: Record<string, unknown>;
}>;

/**
 * Response type of `instances.query`, derived from the shape of the request.
 *
 * The DMS query response mirrors the request: `items` has one array per key in
 * `select`, each item is a node or an edge depending on the matching `with`
 * expression, and `properties` is nested by space, then `externalId/version`
 * of the view, then the property names listed in `sources`. This type
 * reconstructs that relationship so that the response is typed per request.
 *
 * How much is inferred depends on how the request is declared:
 *
 * - A value of the plain `QueryRequest` type (or no type argument) gives the
 *   untyped `QueryResponse`, exactly as before.
 * - An inline object literal infers the result set keys and node/edge kind.
 *   Spaces, views and properties stay wide because TypeScript widens their
 *   string values.
 * - `const query = { ... } as const satisfies QueryRequest` infers everything:
 *   result set keys, node/edge kind, space keys, view keys and property names.
 *
 * Rules that keep the type honest about what the API returns:
 *
 * - A result set that is only conditionally selected (`...(flag ? { a: {} } : {})`)
 *   is optional on `items`, since the API omits it when the condition is false.
 * - `properties` is optional when `sources` is optional in the request, and
 *   absent when no `sources` are given.
 * - A property list that is a widened array (`(keyof T)[]` rather than a tuple)
 *   makes every property optional, since the type cannot know which ones were
 *   selected. `['*']` or a plain `string[]` gives `Record<string, RawPropertyValueV3>`.
 * - `nextCursor` has an optional entry per selected result set. The API omits
 *   the cursor for an exhausted result set in most cases, but has been seen to
 *   return one for a single-item result set too, so paginate until a page
 *   comes back empty rather than relying on the cursor being absent.
 * - A `with` expression that is a union of a nodes and an edges expression gives
 *   `NodeDefinition | EdgeDefinition`.
 *
 * Every level (`items`, spaces, views, properties) also keeps a string index
 * signature with the wide types used by `QueryResponse`, so code that indexes
 * with a runtime string (`items[alias]`) keeps compiling.
 *
 * Known limitation: when the same view is listed twice in `sources`, the API
 * keeps only the last entry, while this type merges both property lists.
 *
 * @typeParam TRequest - The request type. Use `typeof query` on a request
 *   declared `as const satisfies QueryRequest` for full inference.
 * @typeParam TTypedSources - Optional {@link QueryTypedSources} with concrete
 *   property value types per view.
 */
export type QueryResult<
  TRequest extends QueryRequest,
  TTypedSources extends QueryTypedSources = [],
> = QueryRequest extends TRequest
  ? QueryResponse
  : {
      /** One result set per key in the request's `select`. */
      items: WithDynamicKeys<
        {
          [Alias in keyof TRequest['select']]: ResultItem<
            TRequest,
            Alias,
            TTypedSources
          >[];
        },
        NodeOrEdge[]
      >;
      /** Cursors per selected result set. May be absent. */
      nextCursor: WithDynamicKeys<
        { [Alias in keyof TRequest['select']]?: NextCursorV3 },
        NextCursorV3
      >;
      /** Property type information for selected result expressions. */
      typing?: Record<string, TypeInformationOuter>;
    };

/**
 * Keeps the precise types of the known keys in `TKnown` while still allowing
 * indexing with an arbitrary string, which yields `TFallback`. The fallback is
 * the wide type the untyped `QueryResponse` uses at the same level.
 */
type WithDynamicKeys<TKnown, TFallback> = TKnown & {
  [key: string]: TFallback;
};

type ResultItem<
  TRequest extends QueryRequest,
  Alias extends keyof TRequest['select'],
  TTypedSources extends QueryTypedSources,
> = WithSelectedProperties<
  InstanceDefinition<
    Alias extends keyof TRequest['with']
      ? TRequest['with'][Alias]
      : QueryTableExpressionV3
  >,
  TRequest['select'][Alias],
  TTypedSources
>;

/**
 * A `nodes` expression yields nodes, an `edges` expression yields edges. Set
 * operations (`union`, `unionAll`, `intersection`) can yield either. This is
 * distributive, so a union of expressions gives a union of definitions.
 */
type InstanceDefinition<TExpression> =
  TExpression extends QueryNodeTableExpressionV3
    ? NodeDefinition
    : TExpression extends QueryEdgeTableExpressionV3
      ? EdgeDefinition
      : NodeOrEdge;

/** `sources` of a select entry, or `undefined` when the entry has none. */
type SelectSources<TSelect extends QuerySelectV3> =
  'sources' extends keyof TSelect
    ? Extract<TSelect, { sources?: unknown }>['sources']
    : undefined;

type WithSelectedProperties<
  TDefinition extends NodeOrEdge,
  TSelect extends QuerySelectV3,
  TTypedSources extends QueryTypedSources,
> = TDefinition extends NodeOrEdge
  ? SelectSources<TSelect> extends infer TSources
    ? [TSources] extends [undefined]
      ? TDefinition
      : undefined extends TSources
        ? Prettify<
            Omit<TDefinition, 'properties'> & {
              properties?: SelectedProperties<
                NonNullable<TSources>,
                TTypedSources
              >;
            }
          >
        : Prettify<
            Omit<TDefinition, 'properties'> & {
              properties: SelectedProperties<
                NonNullable<TSources>,
                TTypedSources
              >;
            }
          >
    : never
  : never;

/** `properties` nested by space, then by `externalId/version` of the view. */
type SelectedProperties<
  TSources,
  TTypedSources extends QueryTypedSources,
> = TSources extends SourceSelectorV3
  ? WithDynamicKeys<
      {
        [TSource in TSources[number] as TSource['source']['space']]: WithDynamicKeys<
          {
            [TViewSource in TSource as ViewKey<
              TViewSource['source']
            >]: ViewProperties<TViewSource, TTypedSources>;
          },
          PropertyValueGroupV3
        >;
      },
      ViewOrContainer
    >
  : ViewOrContainer;

/**
 * `externalId/version` of the view. Falls back to `string` when either part
 * is not a literal, so that a key built at runtime still indexes the object.
 */
type ViewKey<TView extends ViewReference> = string extends
  | TView['externalId']
  | TView['version']
  ? string
  : `${TView['externalId']}/${TView['version']}`;

type ViewProperties<
  TSource extends SourceSelectorV3[number],
  TTypedSources extends QueryTypedSources,
> = TypedPropertiesFor<
  TSource['source'],
  TTypedSources
> extends infer TTypedProps
  ? '*' extends TSource['properties'][number]
    ? [TTypedProps] extends [never]
      ? PropertyValueGroupV3
      : WithDynamicKeys<TTypedProps, RawPropertyValueV3>
    : string extends TSource['properties'][number]
      ? PropertyValueGroupV3
      : WithDynamicKeys<
          IsTuple<TSource['properties']> extends true
            ? {
                [Property in TSource['properties'][number]]: PropertyType<
                  Property,
                  TTypedProps
                >;
              }
            : {
                [Property in TSource['properties'][number]]?: PropertyType<
                  Property,
                  TTypedProps
                >;
              },
          RawPropertyValueV3
        >
  : never;

/** The caller supplied property types for a view, or `never` if none were given. */
type TypedPropertiesFor<
  TView extends ViewReference,
  TTypedSources extends QueryTypedSources,
> = Extract<TTypedSources[number], { source: TView }>['properties'];

type PropertyType<Property extends PropertyKey, TTypedProps> = [
  TTypedProps,
] extends [never]
  ? RawPropertyValueV3
  : Property extends keyof TTypedProps
    ? TTypedProps[Property]
    : RawPropertyValueV3;

/** `true` for a tuple (`['a', 'b']`), `false` for an array of unknown length. */
type IsTuple<T extends readonly unknown[]> = number extends T['length']
  ? false
  : true;

type Prettify<T> = { [K in keyof T]: T[K] } & NonNullable<unknown>;
