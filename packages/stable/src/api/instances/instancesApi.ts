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
    const response = await this.post<NodeAndEdgeCollectionResponseV3Response>(
      this.searchUrl,
      {
        data: params,
      }
    );
    return response.data;
  };
}
