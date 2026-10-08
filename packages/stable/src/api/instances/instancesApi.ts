// Copyright 2023 Cognite AS

import { BaseResourceAPI } from '@cognite/sdk-core';
import type {
  QueryRequestInput,
  QueryResult,
  QueryTypedSources,
} from './query.types';
import type { SearchRequestInput, SearchResult } from './search.types';
import type {
  AggregationRequest,
  AggregationResponse,
  ByIdsResponse,
  InstanceInspectRequest,
  InstanceInspectResponse,
  ListOfSpaceExternalIdsRequestWithTyping,
  NodeAndEdgeCollectionResponseWithCursorV3Response,
  NodeAndEdgeCreateCollection,
  NodeOrEdge,
  NodeOrEdgeDeleteRequest,
  NodeOrEdgeListRequestV3,
  NodeOrEdgeSearchRequest,
  QueryRequest,
  QueryResponse,
  SlimNodeAndEdgeCollectionResponse,
  SyncRequest,
} from './types.gen';

export class InstancesAPI extends BaseResourceAPI<NodeOrEdge> {
  /**
   * [Search instances](https://developer.cognite.com/api#tag/Instances/operation/searchInstances)
   *
   * The response is typed from the request. Declare the request
   * "as const satisfies SearchRequestInput" to get the node or edge kind and
   * the space and view of `properties` inferred. A request typed as the plain
   * NodeOrEdgeSearchRequest gives the untyped ByIdsResponse. Property values
   * are RawPropertyValueV3 unless you supply their types as the second type
   * argument, see QueryTypedSources, or by assigning the method to a
   * TypedSearch once. `properties` in the request selects the fields to
   * search, it does not limit the properties that are returned.
   *
   * ```js
   *  const request = {
   *    view: {
   *      externalId: 'Describable',
   *      space: 'cdf_core',
   *      type: 'view',
   *      version: 'v1',
   *    },
   *    query: 'your_query',
   *    filter: {
   *      equals: {
   *        property: ['title'],
   *         value: 'your title',
   *      },
   *    },
   *    limit: 1000,
   *  } as const satisfies SearchRequestInput;
   *  const response = await client.instances.search(request);
   *  const title = response.items[0].properties?.cdf_core?.['Describable/v1']?.title;
   * ```
   */
  public search = async <
    TRequest extends SearchRequestInput = NodeOrEdgeSearchRequest,
    TTypedSources extends QueryTypedSources = Record<never, never>,
  >(
    params: TRequest
  ): Promise<SearchResult<TRequest, TTypedSources>> => {
    const response = await this.post<SearchResult<TRequest, TTypedSources>>(
      this.searchUrl,
      {
        data: params,
      }
    );
    return response.data;
  };

  /**
   * [List instances](https://developer.cognite.com/api#tag/Instances/operation/advancedListInstance)
   *
   * ```js
   *  const response = await client.instances.list({
   *    instanceType: 'node',
   *    sources: [{
   *      source: {
   *        externalId: 'Describable',
   *        space: 'cdf_core',
   *        type: 'view',
   *        version: 'v1',
   *      },
   *    }],
   *    filter: {
   *      equals: {
   *        property: ['title'],
   *         value: 'your title',
   *      },
   *    },
   *    sort: [
   *      { property: ['title'], direction: 'ascending', nullsFirst: false },
   *    ],
   *    limit: 1000,
   *});
   * ```
   */
  public list = async (
    params: NodeOrEdgeListRequestV3
  ): Promise<NodeAndEdgeCollectionResponseWithCursorV3Response> => {
    const response =
      await this.post<NodeAndEdgeCollectionResponseWithCursorV3Response>(
        this.listPostUrl,
        {
          data: params,
        }
      );
    return response.data;
  };

  /**
   * [Retrieve instances](https://developer.cognite.com/api#tag/Instances/operation/byExternalIdsInstances)
   *
   * ```js
   *  const response = await client.instances.retrieve({
   *    sources: [{ source: {
   *          externalId: 'Describable',
   *          space: 'cdf_core',
   *          type: 'view',
   *          version: 'v1',
   *        }
   *      }],
   *     items: [
   *       {
   *         externalId: "node-external-id",
   *         space: "node-space",
   *         instanceType: 'node',
   *       },
   *     ],
   *   });
   * ```
   */
  public retrieve = async (
    params: ListOfSpaceExternalIdsRequestWithTyping
  ): Promise<ByIdsResponse> => {
    const response = await this.post<ByIdsResponse>(this.byIdsUrl, {
      data: params,
    });
    return response.data;
  };

  /**
   * [Upsert instances](https://developer.cognite.com/api#tag/Instances/operation/applyNodeAndEdges)
   *
   * ```js
   *  await client.instances.upsert({
   *  items: [
   *    {
   *       instanceType: 'node',
   *       externalId: 'node-external-id',
   *       space: 'node-space',
   *       sources: [
   *        {
   *            source: {
   *             externalId: 'Describable',
   *             space: 'cdf_core',
   *             type: 'view',
   *             version: 'v1',
   *          },
   *            properties: {
   *             title: 'node-title',
   *             description: 'node-description',
   *             labels: 'node-labels',
   *           },
   *         },
   *       ],
   *     },
   *   ],
   * });
   * ```
   */
  public upsert = async (
    params: NodeAndEdgeCreateCollection
  ): Promise<SlimNodeAndEdgeCollectionResponse> => {
    const response = await this.post<SlimNodeAndEdgeCollectionResponse>(
      this.url(),
      {
        data: params,
      }
    );
    return response.data;
  };

  /**
   * [Delete instances](https://developer.cognite.com/api#tag/Instances/operation/deleteBulk)
   *
   * ```js
   *  await client.instances.delete([
   *      {
   *        instanceType: "node",
   *        externalId: "node-external-id",
   *        space: "node-space",
   *      },
   *    ]);
   * ```
   */
  public delete = async (items: NodeOrEdgeDeleteRequest['items']) => {
    return super.deleteEndpoint(items);
  };

  /**
   * [Aggregate instances](https://developer.cognite.com/api#tag/Instances/operation/aggregateInstances)
   *
   * ```js
   *  const response = await client.instances.aggregate({
   *     view: {
   *        externalId: 'Describable',
   *        space: 'cdf_core',
   *        type: 'view',
   *        version: 'v1',
   *     },
   *     groupBy: ['externalId'],
   *     aggregates: [{ count: { property: 'externalId' } }],
   *     filter: {
   *       prefix: {
   *         property: ['title'],
   *         value: 'titl',
   *       },
   *     },
   *     limit: 1,
   *   });
   * ```
   */
  public aggregate = async (
    params: AggregationRequest
  ): Promise<AggregationResponse> => {
    const response = await this.post<AggregationResponse>(this.aggregateUrl, {
      data: params,
    });
    return response.data;
  };

  /**
   * [Query instances](https://developer.cognite.com/api#tag/Instances/operation/queryContent)
   *
   * The response is typed from the request. Declare the request
   * "as const satisfies QueryRequestInput" to get result set keys, node or
   * edge kind, spaces, views and property names inferred (from TypeScript 5.3,
   * "as const satisfies QueryRequest" works as well). A request typed as the
   * plain QueryRequest gives the untyped QueryResponse. Property values are
   * RawPropertyValueV3 unless you supply their types as the second type
   * argument, see QueryTypedSources, or by assigning the method to a
   * TypedQuery once. Cursor values from a previous response can be passed
   * straight through, see QueryRequestInput.
   *
   * ```js
   *  const query = {
   *    with: {
   *      result_set_1: {
   *        nodes: {
   *          filter: {
   *            equals: {
   *              property: ['node', 'externalId'],
   *              value: "node-external-id",
   *            },
   *          },
   *        },
   *      },
   *    },
   *    select: {
   *      result_set_1: {
   *        sources: [
   *          {
   *            source: { type: 'view', space: 'cdf_core', externalId: 'Describable', version: 'v1' },
   *            properties: ['title', 'description'],
   *          },
   *        ],
   *      },
   *    },
   *  } as const satisfies QueryRequestInput;
   *  const response = await client.instances.query(query);
   *  const title = response.items.result_set_1[0].properties.cdf_core['Describable/v1'].title;
   * ```
   */
  public query = async <
    TRequest extends QueryRequestInput = QueryRequest,
    TTypedSources extends QueryTypedSources = Record<never, never>,
  >(
    params: TRequest
  ): Promise<QueryResult<TRequest, TTypedSources>> => {
    const response = await this.post<QueryResult<TRequest, TTypedSources>>(
      this.url('query'),
      {
        data: params,
      }
    );
    return response.data;
  };

  /**
   * [Sync instances](https://developer.cognite.com/api#tag/Instances/operation/syncContent)
   *
   * ```js
   *  const response = await client.instances.sync({
   *     with: {
   *       result_set_1: {
   *         nodes: {
   *           filter: {
   *             equals: {
   *               property: ['node', 'externalId'],
   *               value: "node-external-id",
   *             },
   *           },
   *         },
   *       },
   *     },
   *     select: {
   *       result_set_1: {},
   *     },
   *   });
   * ```
   */
  public sync = async (params: SyncRequest): Promise<QueryResponse> => {
    const response = await this.post<QueryResponse>(this.url('sync'), {
      data: params,
    });
    return response.data;
  };

  /**
   * [Inspect instances](https://developer.cognite.com/api#tag/Instances/operation/instanceInspect)
   *
   * ```js
   *  const response = await client.instances.inspect({
   *    inspectionOperations: {
   *      involvedViews: {
   *        allVersions: true,
   *      },
   *    },
   *    items: [
   *      {
   *        instanceType: 'node',
   *        externalId: 'my-node-id',
   *        space: 'my-space',
   *      },
   *    ],
   *  });
   * ```
   */
  public inspect = async (
    params: InstanceInspectRequest
  ): Promise<InstanceInspectResponse> => {
    const response = await this.post<InstanceInspectResponse>(
      this.url('inspect'),
      {
        data: params,
      }
    );
    return response.data;
  };
}
