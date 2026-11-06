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
  [viewKey: `${string}/${string}/${string}`]: object;
};

/**
 * Builds a {@link QueryTypedSources} map from a list of `{ source, properties }`
 * entries, the shape a code generator emits per view. The list is folded into
 * the keyed map once, when the alias is instantiated, so lookups per query stay
 * constant-time. View references must be literal (`as const`); an entry whose
 * reference is widened to `string` is dropped from the map.
 *
 * ```ts
 * type Model = QueryTypedSourcesFromList<[
 *   { source: typeof EquipmentView; properties: Equipment },
 *   { source: typeof AssetView; properties: Asset },
 * ]>;
 * ```
 */
export type QueryTypedSourcesFromList<
  TList extends readonly QueryTypedSourceEntry[],
> = {
  [Entry in TList[number] as string extends
    | Entry['source']['space']
    | Entry['source']['externalId']
    | Entry['source']['version']
    ? never
    : QueryViewKey<Entry['source']>]: Entry['properties'];
};

/** One entry of {@link QueryTypedSourcesFromList}. */
export type QueryTypedSourceEntry = {
  readonly source: ViewReference;
  readonly properties: object;
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
  const TRequest extends QueryRequestInput = QueryRequest,
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
 *   An `undefined` value is dropped when the request is serialised. `null` is
 *   accepted too: the API treats it as no cursor.
 */
export type QueryRequestInput = DeepReadonly<Omit<QueryRequest, 'cursors'>> & {
  /** Cursors returned from the previous query request, keyed by result set. */
  readonly cursors?: Readonly<Record<string, NextCursorV3 | undefined | null>>;
};

/**
 * Readonly at every level. A type without keys (`object`, `{}`) is kept as is:
 * it already accepts anything, and a mapped type over it would lose that.
 */
type DeepReadonly<T> = T extends readonly (infer U)[]
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
 * - An inline object literal infers everything: result set keys, node/edge
 *   kind, space keys, view keys and property names. The type parameter is
 *   `const`, so the literal is read as if it were declared `as const`.
 * - A request stored in a variable infers the same when it is declared
 *   `as const satisfies QueryRequestInput` (`satisfies QueryRequest` works from
 *   TypeScript 5.3). Without `as const` its string values are widened and the
 *   result keeps the wide property types.
 *
 * Rules that keep the type honest about what the API returns:
 *
 * - A result set that is only conditionally selected (`...(flag ? { a: {} } : {})`)
 *   is optional on `items`, since the API omits it when the condition is false.
 * - A result set that is selected but not defined in `with` gets an error
 *   type instead of items, since the API rejects such a request.
 * - Every selected property is optional. The API omits a property that has no
 *   value, and returns an empty group (`{ 'View/v1': {} }`) for an instance
 *   that has no data in the view at all, so even a non-nullable property is
 *   only certain when the result set is filtered with `hasData` on that view.
 *   Typed sources supply the value types; their properties are optional too.
 * - `['*']`, an empty list (which the API treats like `['*']`) and a plain
 *   `string[]` give `Record<string, RawPropertyValueV3>`, or every typed
 *   property when typed sources are given.
 * - A view key is required only when its selector is certain to be sent: an
 *   element of a `sources` tuple whose `source` is a single view. A `source`
 *   or selector chosen at runtime (`flag ? viewA : viewB`) gives one optional
 *   entry per possible view, each with its own property types, and so does a
 *   `sources` array of unknown length. A space key is required when at least
 *   one of its views is.
 * - `properties` is optional when `sources` is optional in the request, with
 *   every space key optional (the API returns `properties: {}` without
 *   sources), and absent from the type when no `sources` are given.
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
type WithDynamicKeys<TKnown, TFallback> = TKnown & {
  [key: string]: TFallback;
};

type ResultItem<
  TRequest extends QueryRequestInput,
  Alias extends keyof TRequest['select'],
  TTypedSources extends QueryTypedSources,
> = Alias extends keyof TRequest['with']
  ? WithSelectedProperties<
      InstanceDefinition<NonNullable<TRequest['with'][Alias]>>,
      TRequest['select'][Alias],
      TTypedSources
    >
  : SelectedWithoutExpression<Alias>;
/** The API answers 400 when `select` names a result set that `with` does not define. */
type SelectedWithoutExpression<Alias> = {
  readonly __queryError: 'This result set is selected but not defined in `with`. The API rejects the request.';
  readonly alias: Alias;
};
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
/**
 * Distributes a selector whose `source` is a union (`flag ? viewA : viewB`)
 * into one selector per view, so each possible view keeps its own key and
 * its own property types.
 */
type ExpandedSelection<TSource extends SourceSelection> =
  TSource extends SourceSelection
    ? TSource['source'] extends infer TView
      ? TView extends ViewReference
        ? Omit<TSource, 'source'> & {
            readonly source: TView;
          }
        : never
      : never
    : never;
/** `sources` of a select entry, or `undefined` when the entry has none. */
type SelectSources<TSelect extends SelectInput> =
  'sources' extends keyof TSelect
    ? Extract<
        TSelect,
        {
          sources?: unknown;
        }
      >['sources']
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
                TTypedSources,
                false
              >;
            }
          >
        : Prettify<
            Omit<TDefinition, 'properties'> & {
              properties: SelectedProperties<
                NonNullable<TSources>,
                TTypedSources,
                true
              >;
            }
          >
    : never
  : never;

/** One possible view of a selector, and whether its key is certain to be in the response. */
type Entry = {
  readonly selection: SourceSelection;
  readonly required: boolean;
};
type IsUnion<T, U = T> = [T] extends [never]
  ? false
  : T extends unknown
    ? [U] extends [T]
      ? false
      : true
    : never;
type ToEntries<
  TExpanded extends SourceSelection,
  TRequired extends boolean,
> = TExpanded extends SourceSelection
  ? {
      readonly selection: TExpanded;
      readonly required: TRequired;
    }
  : never;
/** A selector that can be one of several views at runtime gives optional keys: only one is returned. */
type EntriesOf<
  TSource extends SourceSelection,
  TCanRequire extends boolean,
> = ExpandedSelection<TSource> extends infer TExpanded extends SourceSelection
  ? ToEntries<
      TExpanded,
      TCanRequire extends true
        ? IsUnion<TExpanded> extends true
          ? false
          : IsUnion<ViewKey<TExpanded['source']>> extends true
            ? false
            : true
        : false
    >
  : never;
/** Only a tuple proves that a selector was sent: an array of unknown length may be empty. */
type SelectionEntries<
  TSources extends readonly SourceSelection[],
  TCanRequire extends boolean,
> = IsTuple<TSources> extends true
  ? {
      [I in keyof TSources]: TSources[I] extends SourceSelection
        ? EntriesOf<TSources[I], TCanRequire>
        : never;
    }[number]
  : EntriesOf<TSources[number], false>;
type EntrySpace<E extends Entry> = E extends Entry
  ? E['selection']['source']['space']
  : never;
type EntryView<E extends Entry> = E extends Entry
  ? ViewKey<E['selection']['source']>
  : never;
type InSpace<E extends Entry, S> = E extends Entry
  ? EntrySpace<E> extends S
    ? E
    : never
  : never;
type InView<E extends Entry, V> = E extends Entry
  ? EntryView<E> extends V
    ? E
    : never
  : never;
type RequiredOf<E extends Entry> = Extract<
  E,
  {
    readonly required: true;
  }
>;
/** `properties` nested by space, then by `externalId/version` of the view. */
type SelectedProperties<
  TSources,
  TTypedSources extends QueryTypedSources,
  TCanRequire extends boolean,
> = TSources extends readonly SourceSelection[]
  ? SelectionEntries<TSources, TCanRequire> extends infer E extends Entry
    ? WithDynamicKeys<
        Prettify<
          {
            [S in EntrySpace<RequiredOf<E>>]: ViewsOf<
              InSpace<E, S>,
              TTypedSources
            >;
          } & {
            [S in Exclude<EntrySpace<E>, EntrySpace<RequiredOf<E>>>]?: ViewsOf<
              InSpace<E, S>,
              TTypedSources
            >;
          }
        >,
        ViewOrContainer
      >
    : ViewOrContainer
  : ViewOrContainer;
type ViewsOf<
  E extends Entry,
  TTypedSources extends QueryTypedSources,
> = WithDynamicKeys<
  Prettify<
    {
      [V in EntryView<RequiredOf<E>>]: ViewProperties<
        InView<E, V>['selection'],
        TTypedSources
      >;
    } & {
      [V in Exclude<EntryView<E>, EntryView<RequiredOf<E>>>]?: ViewProperties<
        InView<E, V>['selection'],
        TTypedSources
      >;
    }
  >,
  PropertyValueGroupV3
>;
/**
 * `externalId/version` of the view. Falls back to `string` when either part
 * is not a literal, so that a key built at runtime still indexes the object.
 */
type ViewKey<TView extends ViewReference> = string extends
  | TView['externalId']
  | TView['version']
  ? string
  : `${TView['externalId']}/${TView['version']}`;
/**
 * Every property is optional: the API omits a property that has no value, and
 * returns an empty group for an instance that has no data in the view at all.
 * An empty list selects everything, like `['*']`.
 */
type ViewProperties<
  TSource extends SourceSelection,
  TTypedSources extends QueryTypedSources,
> = TypedPropertiesFor<
  TSource['source'],
  TTypedSources
> extends infer TTypedProps
  ? [TSource['properties'][number]] extends [never]
    ? AllProperties<TTypedProps>
    : string extends TSource['properties'][number]
      ? AllProperties<TTypedProps>
      : '*' extends TSource['properties'][number]
        ? AllProperties<TTypedProps>
        : WithDynamicKeys<
            {
              [Property in TSource['properties'][number]]?: PropertyType<
                Property,
                TTypedProps
              >;
            },
            RawPropertyValueV3
          >
  : never;
type AllProperties<TTypedProps> = [TTypedProps] extends [never]
  ? PropertyValueGroupV3
  : WithDynamicKeys<Partial<TTypedProps>, RawPropertyValueV3>;
/** The caller supplied property types for a view, or `never` if none were given. */
type TypedPropertiesFor<
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
type Prettify<T> = {
  [K in keyof T]: T[K];
} & NonNullable<unknown>;
