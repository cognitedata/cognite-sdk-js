// Copyright 2025 Cognite AS

import type {
  DeepReadonly,
  QueryTypedSources,
  TypedPropertiesFor,
  WithDynamicKeys,
} from './query.types';
import type {
  ByIdsResponse,
  EdgeDefinition,
  NodeDefinition,
  NodeOrEdge,
  NodeOrEdgeSearchRequest,
  PropertyValueGroupV3,
  RawPropertyValueV3,
  ViewReference,
} from './types.gen';

/**
 * Request type accepted by `instances.search`. It is `NodeOrEdgeSearchRequest`
 * with every array and object allowed to be `readonly`, so a request declared
 * `as const` is accepted on every supported TypeScript version. A plain
 * `NodeOrEdgeSearchRequest` always satisfies it.
 */
export type SearchRequestInput = DeepReadonly<NodeOrEdgeSearchRequest>;

/**
 * `instances.search` with the property value types fixed and the request still
 * inferred per call. Assign the method once and use the result everywhere:
 *
 * ```ts
 * type Model = { 'cdf_core/Describable/v1': { title: string } };
 * const search: TypedSearch<Model> = client.instances.search;
 * const response = await search(request);
 * ```
 */
export type TypedSearch<TTypedSources extends QueryTypedSources> = <
  const TRequest extends SearchRequestInput = NodeOrEdgeSearchRequest,
>(
  params: TRequest
) => Promise<SearchResult<TRequest, TTypedSources>>;

/**
 * Response type of `instances.search`, derived from the request.
 *
 * - A request typed as the plain `NodeOrEdgeSearchRequest`, or one whose `view`
 *   is not made of literals, gives the untyped `ByIdsResponse`.
 * - An inline request literal, or one declared `as const`, types `items`: an
 *   `instanceType` of `'node'` or `'edge'` narrows the items to that kind
 *   (otherwise they are either), and `properties` is nested by the space and
 *   `externalId/version` of `view`. A request stored in a variable without
 *   `as const` has widened strings and gives `ByIdsResponse`. Search does not project the response: `request.properties` selects
 *   the fields that are searched, so every property of the view can be
 *   returned.
 * - Property values are `RawPropertyValueV3` unless the view is in
 *   `TTypedSources` (see {@link QueryTypedSources}), keyed
 *   `space/externalId/version`. Indexing with another property name still
 *   compiles and gives `RawPropertyValueV3`.
 *
 * @typeParam TRequest - The search request.
 * @typeParam TTypedSources - Optional property value types per view.
 */
export type SearchResult<
  TRequest extends SearchRequestInput,
  TTypedSources extends QueryTypedSources = Record<never, never>,
> = NodeOrEdgeSearchRequest extends TRequest
  ? ByIdsResponse
  : string extends
        | TRequest['view']['space']
        | TRequest['view']['externalId']
        | TRequest['view']['version']
    ? ByIdsResponse
    : Omit<ByIdsResponse, 'items'> & {
        items: WithViewProperties<
          InstanceFor<TRequest>,
          TRequest['view'],
          ViewPropertiesFor<TRequest['view'], TTypedSources>
        >[];
      };

/** A node, an edge, or either, depending on the request's `instanceType`. */
type InstanceFor<TRequest extends SearchRequestInput> = TRequest extends {
  readonly instanceType: 'node';
}
  ? NodeDefinition
  : TRequest extends { readonly instanceType: 'edge' }
    ? EdgeDefinition
    : NodeOrEdge;

/**
 * Like the untyped `NodeDefinition`, `properties` is optional but its space and
 * view levels are not, so `properties?.[space][view]` keeps compiling.
 * Distributive, so an item that is either a node or an edge keeps both.
 */
type WithViewProperties<
  TInstance,
  TView extends ViewReference,
  TProperties,
> = TInstance extends NodeOrEdge
  ? Omit<TInstance, 'properties'> & {
      properties?: {
        [Space in TView['space']]: {
          [Key in `${TView['externalId']}/${TView['version']}`]: TProperties;
        };
      };
    }
  : never;

/** The caller supplied property types, or the raw values the API returns. */
type ViewPropertiesFor<
  TView extends ViewReference,
  TTypedSources extends QueryTypedSources,
> = [TypedPropertiesFor<TView, TTypedSources>] extends [never]
  ? PropertyValueGroupV3
  : WithDynamicKeys<
      TypedPropertiesFor<TView, TTypedSources>,
      RawPropertyValueV3
    >;
