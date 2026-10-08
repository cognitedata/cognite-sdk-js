// Copyright 2025 Cognite AS

import type {
  EdgeDefinition,
  NextCursorV3,
  NodeDefinition,
  NodeOrEdge,
  PropertyValueGroupV3,
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
 * Key of a view in {@link QueryTypedSources}: `space/externalId/version`.
 *
 * ```ts
 * type DescribableKey = QueryViewKey<typeof describableView>; // 'cdf_core/Describable/v1'
 * ```
 */
export type QueryViewKey<TView extends ViewReference> =
  `${TView['space']}/${TView['externalId']}/${TView['version']}`;

/**
 * Optional, caller supplied property value types for {@link QueryResult},
 * keyed by view as `space/externalId/version` (see {@link QueryViewKey}).
 *
 * The DMS API does not tell the SDK which TypeScript type a property has, so
 * selected properties are typed as `RawPropertyValueV3` by default. Pass a map
 * from view key to property types as the second type argument of
 * `instances.query` to replace that for the views you know. Views that are
 * not in the map keep `RawPropertyValueV3`. The map is looked up by key, so a
 * map covering a whole data model costs nothing extra per call.
 *
 * ```ts
 * const response = await client.instances.query<
 *   typeof query,
 *   { 'cdf_core/Describable/v1': { title: string; labels: string[] } }
 * >(query);
 * ```
 */
export type QueryTypedSources = {
  [viewKey: `${string}/${string}/${string}`]: Record<string, unknown>;
};

/**
 * `instances.query` with the property value types fixed and the request still
 * inferred per call. Assign the method once and use the result everywhere, so
 * callers never spell out `<typeof request, Model>`:
 *
 * ```ts
 * type Model = { 'cdf_core/Describable/v1': { title: string; labels: string[] } };
 * const query: TypedQuery<Model> = client.instances.query;
 *
 * const response = await query(request);          // typed from `request` and `Model`
 * await query({ ...request, cursors: { rs: response.nextCursor.rs } });
 * ```
 *
 * `instances.query` is an arrow function property, so it can be detached from
 * the client safely.
 */
export type TypedQuery<TTypedSources extends QueryTypedSources> = <
  TRequest extends QueryRequestInput = QueryRequest,
>(
  params: TRequest
) => Promise<QueryResult<TRequest, TTypedSources>>;

/**
 * Request type accepted by `instances.query`. It is `QueryRequest` with two
 * relaxations, and a plain `QueryRequest` always satisfies it:
 *
 * - Every array and object may be `readonly`, so a request declared
 *   `as const` is accepted on every supported TypeScript version. (From
 *   TypeScript 5.3, `as const satisfies QueryRequest` also works, because the
 *   compiler then infers mutable tuples; `as const satisfies QueryRequestInput`
 *   works everywhere.)
 * - Cursor values may be `undefined`, so a cursor from a previous response can
 *   be passed straight through (`cursors: { alias: previous.nextCursor.alias }`).
 *   An `undefined` value is dropped when the request is serialised.
 */
export type QueryRequestInput = DeepReadonly<Omit<QueryRequest, 'cursors'>> & {
  /** Cursors returned from the previous query request, keyed by result set. */
  readonly cursors?: Readonly<Record<string, NextCursorV3 | undefined>>;
};

/**
 * Readonly at every level. A type without keys (`object`, `{}`) is kept as is:
 * it already accepts anything, and a mapped type over it would lose that.
 */
export type DeepReadonly<T> = T extends readonly (infer U)[]
  ? ReadonlyArray<DeepReadonly<U>>
  : T extends object
    ? [keyof T] extends [never]
      ? T
      : { readonly [K in keyof T]: DeepReadonly<T[K]> }
    : T;

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
 * - `const query = { ... } as const satisfies QueryRequestInput` infers
 *   everything: result set keys, node/edge kind, space keys, view keys and
 *   property names. (`satisfies QueryRequest` works from TypeScript 5.3.)
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
 * @typeParam TRequest - The request type ({@link QueryRequestInput}). Use
 *   `typeof query` on a request declared `as const satisfies QueryRequestInput`
 *   for full inference.
 * @typeParam TTypedSources - Optional {@link QueryTypedSources}: concrete
 *   property value types per view, keyed `space/externalId/version`.
 */
export type QueryResult<
  TRequest extends QueryRequestInput,
  TTypedSources extends QueryTypedSources = Record<never, never>,
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
export type WithDynamicKeys<TKnown, TFallback> = TKnown & {
  [key: string]: TFallback;
};

type ResultItem<
  TRequest extends QueryRequestInput,
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
type InstanceDefinition<TExpression> = TExpression extends {
  readonly nodes: unknown;
}
  ? NodeDefinition
  : TExpression extends { readonly edges: unknown }
    ? EdgeDefinition
    : NodeOrEdge;

/** A `select` entry as accepted by {@link QueryRequestInput}. */
type SelectInput = DeepReadonly<QuerySelectV3>;

/** One entry of `sources` as accepted by {@link QueryRequestInput}. */
type SourceSelection = DeepReadonly<SourceSelectorV3[number]>;

/** `sources` of a select entry, or `undefined` when the entry has none. */
type SelectSources<TSelect extends SelectInput> =
  'sources' extends keyof TSelect
    ? Extract<TSelect, { sources?: unknown }>['sources']
    : undefined;

type WithSelectedProperties<
  TDefinition extends NodeOrEdge,
  TSelect extends SelectInput,
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
> = TSources extends readonly SourceSelection[]
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
  TSource extends SourceSelection,
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
export type TypedPropertiesFor<
  TView extends ViewReference,
  TTypedSources extends QueryTypedSources,
> = QueryViewKey<TView> extends infer TKey
  ? TKey extends keyof TTypedSources
    ? TTypedSources[TKey]
    : never
  : never;

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
