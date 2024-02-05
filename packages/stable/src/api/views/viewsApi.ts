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
  ViewCreateDefinition,
  ViewCollectionResponse,
  ViewDefinition,
  SpaceQueryParameter,
  ListOfVersionReferences,
  AllVersionsQueryParameter,
  IncludeInheritedPropertiesQueryParameter,
  ListOfAllVersionsReferences,
} from './types.gen';

export class ViewsAPI extends BaseResourceAPI<ViewDefinition> {
  constructor(...args: [string, CDFHttpClient, MetadataMap]) {
    super(...args);
  }

  /**
   * [Upsert Views](https://api-docs.cognite.com/20230101/tag/Views/operation/ApplyViews)
   *
   * ```js
   * const viewDefinition = {
   *  "externalId": "string",
   *   "space": "string",
   *   "name": "string",
   *   "description": "string",
   *   "filter": {
   *     "and": []
   *   },
   *   "implements": [
   *     {
   *       "type": "view",
   *       "space": "string",
   *       "externalId": "string",
   *       "version": "string"
   *     }
   *   ],
   *   "version": "string",
   *   "properties": {}
   *  };
   *
   *  const response = await client.views.upsert([
   *   viewDefinition
   *  ]);
   * ```
   */
  public upsert = async (
    params: ViewCreateDefinition[]
  ): Promise<ViewCollectionResponse> => {
    const response = await this.post<ViewCollectionResponse>(this.url(), {
      data: { items: params },
    });
    return response.data;
  };

  /**
   * [Delete Views](https://api-docs.cognite.com/20230101/tag/Views/operation/deleteViews)
   *
   * ```js
   *  const response = await client.views.delete([{
   *    space: "my_space",
   *    externalId: "my_external_id",
   *    version: "my_version"
   *  }]);
   *
   * ```
   */
  public delete = async (
    params: ListOfVersionReferences['items']
  ): Promise<ListOfVersionReferences> => {
    const response = await this.post<ListOfVersionReferences>(this.deleteUrl, {
      data: { items: params },
    });
    return response.data;
  };

  /**
   * [List Views](https://api-docs.cognite.com/20230101/tag/Views/operation/listViews)
   *
   * ```js
   *  const response = await client.views.list();
   *
   * ```
   */
  public list = (
    params: IncludeGlobalQueryParameter &
      CursorQueryParameter &
      ReducedLimitQueryParameter &
      SpaceQueryParameter &
      IncludeInheritedPropertiesQueryParameter &
      AllVersionsQueryParameter = { includeGlobal: false }
  ): CursorAndAsyncIterator<ViewDefinition> => {
    return super.listEndpoint(this.callListEndpointWithGet, params);
  };

  /**
   * [Retrieve Views](https://api-docs.cognite.com/20230101/tag/Views/operation/byExternalIdsViews)
   *
   * ```js
   *  const response = await client.views.retrieve(["my_space"]);
   *
   * ```
   */
  public retrieve = async (
    params: (ListOfVersionReferences | ListOfAllVersionsReferences)['items'],
    options: IncludeInheritedPropertiesQueryParameter = {}
  ): Promise<ViewCollectionResponse> => {
    const response = await this.post<ViewCollectionResponse>(this.byIdsUrl, {
      data: { items: params, ...options },
    });
    return response.data;
  };
}
