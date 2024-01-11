// Copyright 2023 Cognite AS

import { BaseResourceAPI } from '@cognite/sdk-core';
import {
  NodeAndEdgeCollectionResponseV3Response,
  NodeOrEdge,
  NodeOrEdgeSearchRequest,
} from './types.gen';

export class InstancesAPI extends BaseResourceAPI<NodeOrEdge> {
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
    return this.searchInstances<NodeAndEdgeCollectionResponseV3Response>(
      params
    );
  };

  private async searchInstances<ResponseType>(
    params: NodeOrEdgeSearchRequest
  ): Promise<ResponseType> {
    const response = await this.post<ResponseType>(this.searchUrl, {
      data: params,
    });

    return response.data;
  }
}
