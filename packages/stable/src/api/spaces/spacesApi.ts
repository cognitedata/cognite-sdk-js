// Copyright 2023 Cognite AS

import {
  BaseResourceAPI,
  CDFHttpClient,
  CursorAndAsyncIterator,
  MetadataMap,
} from '@cognite/sdk-core';
import {
  CursorQueryParameter,
  IncludeGlobalQueryParameter,
  ReducedLimitQueryParameter,
  SpaceCollectionResponseV3Response,
  SpaceCreateDefinition,
  SpaceDefinition,
} from './types.gen';

export class SpacesAPI extends BaseResourceAPI<SpaceDefinition> {
  constructor(...args: [string, CDFHttpClient, MetadataMap]) {
    super(...args);
  }

  /**
   * [Upsert spaces](https://api-docs.cognite.com/20230101/tag/Spaces/operation/ApplySpaces)
   *
   * const spaceDefinition = {
   *    space: 'my_space',
   *    name: 'my_space',
   *    description: 'My space for data',
   *   };
   *
   * ```js
   *  const response = await client.spaces.upsert([
   *   spaceDefinition
   *  ]);
   * ```
   */
  public upsert = async (
    params: SpaceCreateDefinition[]
  ): Promise<SpaceCollectionResponseV3Response> => {
    const response = await this.post<SpaceCollectionResponseV3Response>(
      this.url(),
      {
        data: { items: params },
      }
    );
    return response.data;
  };

  /**
   * [Delete spaces](https://api-docs.cognite.com/20230101/tag/Spaces/operation/deleteSpacesV3)
   *
   * ```js
   *  const response = await client.instances.delete(["my_space"]);
   *
   * ```
   */
  public delete = async (params: string[]): Promise<{ items: string[] }> => {
    const response = await this.post<{ items: string[] }>(this.deleteUrl, {
      data: { items: params },
    });
    return response.data;
  };

  /**
   * [List spaces](https://api-docs.cognite.com/20230101/tag/Spaces/operation/listSpacesV3)
   *
   * ```js
   *  const response = await client.instances.list(["my_space"]);
   *
   * ```
   */
  public list = (
    params: IncludeGlobalQueryParameter &
      CursorQueryParameter &
      ReducedLimitQueryParameter = { includeGlobal: false }
  ): CursorAndAsyncIterator<SpaceDefinition> => {
    return super.listEndpoint(this.callListEndpointWithGet, params);
  };

  /**
   * [Retrieve spaces](https://api-docs.cognite.com/20230101/tag/Spaces/operation/bySpaceIdsSpaces)
   *
   * ```js
   *  const response = await client.instances.retrieve(["my_space"]);
   *
   * ```
   */
  public retrieve = async (
    params: string[]
  ): Promise<SpaceCollectionResponseV3Response> => {
    const response = await this.post<SpaceCollectionResponseV3Response>(
      this.byIdsUrl,
      {
        data: { items: params },
      }
    );
    return response.data;
  };
}
