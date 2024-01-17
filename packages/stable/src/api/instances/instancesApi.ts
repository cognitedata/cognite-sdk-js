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
   * // TODO: Write example code here
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
   * // TODO: Write example code here
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
