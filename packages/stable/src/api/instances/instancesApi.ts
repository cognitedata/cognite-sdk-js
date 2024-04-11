// Copyright 2023 Cognite AS

import { BaseResourceAPI, CDFHttpClient, MetadataMap } from '@cognite/sdk-core';
import {
  AggregationResponse,
  ListOfSpaceExternalIdsRequestWithTyping,
  NodeAndEdgeCollectionResponseV3Response,
  NodeAndEdgeCollectionResponseWithCursorV3Response,
  NodeAndEdgeCreateCollection,
  NodeOrEdge,
  NodeOrEdgeListRequestV3,
  NodeOrEdgeSearchRequest,
  QueryRequest,
  QueryResponse,
  SlimNodeAndEdgeCollectionResponse,
  SyncRequest,
  ViewAggregationRequest,
} from './types.gen';

export class InstancesAPI extends BaseResourceAPI<NodeOrEdge> {
  constructor(...args: [string, CDFHttpClient, MetadataMap]) {
    super(...args);
  }

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
   *  const view = {
   *    externalId: 'Describable',
   *    space: 'cdf_core',
   *    type: 'view',
   *    version: 'v1',
   *  };
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
   *  const view = {
   *    externalId: 'Describable',
   *    space: 'cdf_core',
   *    type: 'view',
   *    version: 'v1',
   *  };
   *  const response = await client.instances.retrieve({
   *    sources: [{ source: view }],
   *     items: [
   *       {
   *         externalId: describable1.externalId,
   *         space: testSpace.space,
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
   *  const view = {
   *    externalId: 'Describable',
   *    space: 'cdf_core',
   *    type: 'view',
   *    version: 'v1',
   *  };
   *  await client.instances.upsert({
   *   items: describables.map((describable) => ({
   *       instanceType: 'node',
   *       externalId: describable.externalId,
   *       space: describable.space,
   *       sources: [
   *         {
   *           source: view,
   *           properties: {
   *             title: describable.title,
   *             description: describable.description,
   *             labels: describable.labels,
   *           },
   *         },
   *       ],
   *     })),
   *   });
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
   *  await client.instances.delete({
   *   items: [
   *      {
   *        instanceType: 'node',
   *        externalId: describable1.externalId,
   *        space: testSpace.space,
   *      },
   *      {
   *        instanceType: 'node',
   *        externalId: describable2.externalId,
   *        space: testSpace.space,
   *      },
   *    ],
   *   })
   * ```
   */
  public delete = async (params: ListOfSpaceExternalIdsRequestWithTyping) => {
    await this.delete(params);
  };

  /**
   * [Aggregate instances](https://developer.cognite.com/api#tag/Instances/operation/aggregateInstances)
   *
   * ```js
   *  const view = {
   *    externalId: 'Describable',
   *    space: 'cdf_core',
   *    type: 'view',
   *    version: 'v1',
   *  };
   *  const response = await client.instances.aggregate({
   *     view,
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
   *  const view = {
   *    externalId: 'Describable',
   *    space: 'cdf_core',
   *    type: 'view',
   *    version: 'v1',
   *  };
   *  const response = await client.instances.query({
   *     with: {
   *       result_set_1: {
   *         nodes: {
   *           filter: {
   *             equals: {
   *               property: ['node', 'externalId'],
   *               value: describable1.externalId,
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
   *  const view = {
   *    externalId: 'Describable',
   *    space: 'cdf_core',
   *    type: 'view',
   *    version: 'v1',
   *  };
   *  const response = await client.instances.sync({
   *     with: {
   *       result_set_1: {
   *         nodes: {
   *           filter: {
   *             equals: {
   *               property: ['node', 'externalId'],
   *               value: describable1.externalId,
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
