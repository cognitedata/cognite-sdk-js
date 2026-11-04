// Copyright 2023 Cognite AS

import {
  BaseResourceAPI,
  type CursorAndAsyncIterator,
} from '@cognite/sdk-core';
import type { ViewListParams } from './types';
import type {
  IncludeInheritedPropertiesQueryParameter,
  ListOfAllVersionsReferences,
  ListOfVersionReferences,
  ViewCollectionResponse,
  ViewCreateDefinition,
  ViewDefinition,
} from './types.gen';

export class ViewsAPI extends BaseResourceAPI<ViewDefinition> {
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
   *
   *  // A view becomes a record view by setting streamId. Do not send usedFor:
   *  // it is read-only and returned as 'record' when the view is retrieved.
   *  const recordViewDefinition = {
   *    "externalId": "my_record_view",
   *    "space": "my_space",
   *    "version": "1",
   *    "streamId": ["my_stream"],
   *    "properties": {
   *      "temperature": {
   *        "container": {
   *          "type": "container",
   *          "externalId": "my_record_container",
   *          "space": "my_space"
   *        },
   *        "containerPropertyIdentifier": "temperature"
   *      }
   *    }
   *  };
   *
   *  const recordResponse = await client.views.upsert([
   *   recordViewDefinition
   *  ]);
   * ```
   *
   * @remarks
   * The `streamId` of a record view version cannot be changed after it is
   * created; publish a new view version to target another stream. A record
   * view can only be used as a source for records in the stream it targets.
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
   *  // Record views are excluded by default; opt in with `usedFor`
   *  const recordViews = await client.views.list({ usedFor: ['record'] });
   *
   *  // List every kind of view
   *  const allViews = await client.views.list({
   *    usedFor: ['node', 'edge', 'all', 'record'],
   *  });
   *
   * ```
   */
  public list = (
    params: ViewListParams = { includeGlobal: false }
  ): CursorAndAsyncIterator<ViewDefinition> => {
    return super.listEndpoint(
      this.callListGetEndpointWithRepeatedQueryParams,
      params
    );
  };

  /**
   * [Retrieve Views](https://api-docs.cognite.com/20230101/tag/Views/operation/byExternalIdsViews)
   *
   * ```js
   *  const response = await client.views.retrieve([
   *  {
   *   space: "my_space",
   *   externalId: "my_external_id",
   *   version: "my_optional_version"
   *  }
   * ]);
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
