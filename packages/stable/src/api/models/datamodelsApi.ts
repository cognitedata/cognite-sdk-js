// Copyright 2023 Cognite AS

import { BaseResourceAPI, CDFHttpClient, MetadataMap } from '@cognite/sdk-core';
import {
  AllVersionsQueryParameter,
  CursorQueryParameter,
  DataModel,
  DataModelCollectionResponse,
  DataModelCollectionResponseWithCursorResponse,
  DataModelCreate,
  IncludeGlobalQueryParameter,
  InlineViewsQueryParameter,
  ListOfAllVersionsReferences,
  ListOfVersionReferences,
  ReducedLimitQueryParameter,
  SpaceQueryParameter,
} from './types.gen';

export class DataModelsAPI extends BaseResourceAPI<DataModel> {
  constructor(...args: [string, CDFHttpClient, MetadataMap]) {
    super(...args);
  }

  /**
   * [Upsert datamodels](https://api-docs.cognite.com/20230101/tag/Data-models/operation/createDataModels)
   *
   * const datamodelDefinition = {
   *   "space": "string",
   *   "externalId": "string",
   *   "name": "string",
   *   "description": "string",
   *   "version": "string",
   *   "views": []
   * }
   *
   * ```js
   *  const response = await client.dataModels.upsert([
   *   datamodelDefinition
   *  ]);
   * ```
   */
  public upsert = async (
    params: DataModelCreate[]
  ): Promise<DataModelCollectionResponse> => {
    const response = await this.post<DataModelCollectionResponse>(this.url(), {
      data: { items: params },
    });
    return response.data;
  };

  /**
   * [Delete data models](https://api-docs.cognite.com/20230101/tag/Data-models/operation/deleteDataModels)
   *
   * ```js
   *  const response = await client.dataModels.delete([{ externalId: "", space: "", version: ""}]);
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
   * [List data models](https://api-docs.cognite.com/20230101/tag/Data-models/operation/listDataModels)
   *
   * ```js
   *  const response = await client.dataModels.list();
   *
   * ```
   */
  public list = (
    params: IncludeGlobalQueryParameter &
      SpaceQueryParameter &
      CursorQueryParameter &
      ReducedLimitQueryParameter &
      AllVersionsQueryParameter &
      InlineViewsQueryParameter = { includeGlobal: false }
  ): DataModelCollectionResponseWithCursorResponse => {
    return super.listEndpoint(this.callListEndpointWithGet, params);
  };

  /**
   * [Retrieve data models](https://api-docs.cognite.com/20230101/tag/Data-models/operation/byExternalIdsDataModels)
   *
   * ```js
   *  const response = await client.dataModels.retrieve([{ externalId: "", space: "", version: "optional"}]);
   *
   * ```
   */
  public retrieve = async (
    params: (ListOfVersionReferences | ListOfAllVersionsReferences)['items'],
    options: InlineViewsQueryParameter = {}
  ): Promise<DataModelCollectionResponse> => {
    const response = await this.post<DataModelCollectionResponse>(
      this.byIdsUrl,
      {
        data: { items: params, ...options },
      }
    );
    return response.data;
  };
}
