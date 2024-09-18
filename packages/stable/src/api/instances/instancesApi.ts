// Copyright 2023 Cognite AS

import { BaseResourceAPI } from '@cognite/sdk-core';
import type {
  AggregationResponse,
  ListOfSpaceExternalIdsRequestWithTyping,
  NodeAndEdgeCollectionResponseV3Response,
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
  ViewAggregationRequest,
} from './types.gen';

export class InstancesAPI extends BaseResourceAPI<NodeOrEdge> {
  /**
   * [Search instances](https://developer.cognite.com/api#tag/Instances/operation/searchInstances)
   *
   * ```js
   *  const response = await client.instances.search({
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
   *  });
   * ```
   */
  public search = async (
    params: NodeOrEdgeSearchRequest
  ): Promise<NodeAndEdgeCollectionResponseV3Response> => {
    const response = await this.post<NodeAndEdgeCollectionResponseV3Response>(
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
  ): Promise<NodeAndEdgeCollectionResponseV3Response> => {
    const response = await this.post<NodeAndEdgeCollectionResponseV3Response>(
      this.byIdsUrl,
      {
        data: params,
      }
    );
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
    params: ViewAggregationRequest
  ): Promise<AggregationResponse> => {
    const response = await this.post<AggregationResponse>(this.aggregateUrl, {
      data: params,
    });
    return response.data;
  };

  /**
   * [Query instances](https://developer.cognite.com/api#tag/Instances/operation/queryContent)
   *
   * ```js
   *  const response = await client.instances.query({
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
  public query = async (params: QueryRequest): Promise<QueryResponse> => {
    const response = await this.post<QueryResponse>(this.url('query'), {
      data: params,
    });
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
}
