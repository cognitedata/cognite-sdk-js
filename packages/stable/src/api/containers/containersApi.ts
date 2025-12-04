// Copyright 2023 Cognite AS

import {
  BaseResourceAPI,
  type CursorAndAsyncIterator,
} from '@cognite/sdk-core';
import type {
  ContainerCollectionResponse,
  ContainerCreateDefinition,
  ContainerDefinition,
  CursorQueryParameter,
  IncludeGlobalQueryParameter,
  ListOfSpaceExternalIdsRequest,
  ListOfSpaceExternalIdsResponse,
  ReducedLimitQueryParameter,
  SpaceQueryParameter,
  UsedForQueryParameter,
} from './types.gen';

type ContainerListParams = IncludeGlobalQueryParameter &
  CursorQueryParameter &
  ReducedLimitQueryParameter &
  SpaceQueryParameter &
  UsedForQueryParameter;

export class ContainersAPI extends BaseResourceAPI<ContainerDefinition> {
  /**
   * [Upsert containers](https://api-docs.cognite.com/20230101/tag/Containers/operation/ApplyContainers)
   *
   * ```js
   * const containerDefinition = {
   *     "space": "string",
   *     "externalId": "string",
   *     "name": "string",
   *     "description": "string",
   *     "usedFor": "node",
   *     "properties": {
   *     "containerPropertyIdentifier1": {},
   *     "containerPropertyIdentifier2": {}
   *   },
   *   "constraints": {
   *     "constraint-identifier1": {},
   *     "constraint-identifier2": {}
   *   },
   *   "indexes": {
   *     "index-identifier1": {},
   *     "index-identifier2": {}
   *   }
   * }
   *  const response = await client.containers.upsert([
   *   containerDefinition
   *  ]);
   * ```
   */
  public upsert = async (
    params: ContainerCreateDefinition[]
  ): Promise<ContainerCollectionResponse> => {
    const response = await this.post<ContainerCollectionResponse>(this.url(), {
      data: { items: params },
    });
    return response.data;
  };

  /**
   * [Delete containers](https://api-docs.cognite.com/20230101/tag/Containers/operation/deleteContainers)
   *
   * ```js
   *  const response = await client.containers.delete([{
   *    space: "my_space",
   *    externalId: "my_external_id"
   *  }]);
   *
   * ```
   */
  public delete = async (
    params: ListOfSpaceExternalIdsRequest['items']
  ): Promise<ListOfSpaceExternalIdsResponse> => {
    const response = await this.post<ListOfSpaceExternalIdsResponse>(
      this.deleteUrl,
      {
        data: { items: params },
      }
    );
    return response.data;
  };

  /**
   * [List containers](https://api-docs.cognite.com/20230101/tag/Containers/operation/listContainers)
   *
   * ```js
   *  const response = await client.containers.list({ space: '', includeGlobal: true });
   *  // List only record containers
   *  const recordContainers = await client.containers.list({ usedFor: ['record'] });
   *  // List all container types including records
   *  const allContainers = await client.containers.list({ usedFor: ['node', 'edge', 'all', 'record'] });
   * ```
   */
  public list = (
    params: ContainerListParams = { includeGlobal: false }
  ): CursorAndAsyncIterator<ContainerDefinition> => {
    return super.listEndpoint(
      this.callListEndpointWithRepeatedQueryParams,
      params
    );
  };

  /**
   * [Retrieve containers](https://api-docs.cognite.com/20230101/tag/Containers/operation/byExternalIdsContainers)
   *
   * ```js
   *  const response = await client.containers.retrieve([
   *   {
   *    space: "my_space",
   *    externalId: "my_external_id"
   *   }
   * ]);
   *
   * ```
   */
  public retrieve = async (
    params: ListOfSpaceExternalIdsRequest['items']
  ): Promise<ContainerCollectionResponse> => {
    const response = await this.post<ContainerCollectionResponse>(
      this.byIdsUrl,
      {
        data: { items: params },
      }
    );
    return response.data;
  };
}
