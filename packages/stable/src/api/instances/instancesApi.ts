// Copyright 2023 Cognite AS

import { BaseResourceAPI, CDFHttpClient, MetadataMap } from '@cognite/sdk-core';
import {
  NodeAndEdgeCollectionResponseV3Response,
  NodeAndEdgeCollectionResponseWithCursorV3Response,
  NodeOrEdge,
  NodeOrEdgeListRequestV3,
  NodeOrEdgeSearchRequest,
} from './types.gen';

export class InstancesAPI extends BaseResourceAPI<NodeOrEdge> {
  constructor(...args: [string, CDFHttpClient, MetadataMap]) {
    super(...args);
  }

  /**
   * [Search instances](https://developer.cognite.com/api#tag/Instances/operation/searchInstances)
   *
   * ```js
   *  const view = {
   *    externalId: 'Describable',
   *    space: 'cdf_core',
   *    type: 'view',
   *    version: 'v1',
   *  };
   *  const response = await client.instances.search({
   *    view,
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
   *    sources: [{ source: view }],
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
}
