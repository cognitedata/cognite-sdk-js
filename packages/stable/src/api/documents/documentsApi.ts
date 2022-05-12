// Copyright 2022 Cognite AS

import {
  BaseResourceAPI,
  CDFHttpClient,
  MetadataMap,
  CogniteInternalId,
} from '@cognite/sdk-core';

import {
  Document,
  DocumentSearchResponse,
  DocumentSearchRequest,
  DocumentListRequest,
  DocumentListResponse,
} from '../../types';

import { PreviewAPI } from './previewApi';

export class DocumentsAPI extends BaseResourceAPI<Document> {
  private readonly previewAPI: PreviewAPI;

  constructor(...args: [string, CDFHttpClient, MetadataMap]) {
    super(...args);

    const [baseUrl, httpClient, map] = args;
    this.previewAPI = new PreviewAPI(baseUrl, httpClient, map);
  }

  public get preview() {
    return this.previewAPI;
  }

  /**
   * [Search for documents](https://docs.cognite.com/api/v1/#operation/documentsSearch)
   *
   * ```js
   * const documents = await client.documents.search({
   *   search: {
   *     query: 'Stuck pipe'
   *   },
   *   filter: {
   *     in: {
   *       property: ['type'],
   *       values: ['Document', 'PDF']
   *     }
   *   },
   *   limit: 5
   * });
   * ```
   */
  public search = (
    query: DocumentSearchRequest
  ): Promise<DocumentSearchResponse> => {
    return this.searchDocuments<DocumentSearchResponse>(query);
  };

  public list = (
    request: DocumentListRequest
  ): Promise<DocumentListResponse> => {
    return this.listEndpoint(this.callListEndpointWithPost, request);
  };

  public content = (id: CogniteInternalId): Promise<string> => {
    return this.documentContent<string>(id);
  };

  private async searchDocuments<ResponseType>(
    query: DocumentSearchRequest
  ): Promise<ResponseType> {
    const response = await this.post<ResponseType>(this.searchUrl, {
      data: query,
    });

    return this.addToMapAndReturn(response.data, response);
  }

  private async documentContent<ResponseType>(
    id: CogniteInternalId
  ): Promise<ResponseType> {
    const response = await this.get<ResponseType>(this.url(`${id}/content`), {
      headers: {
        accept: 'text/plain',
      },
    });
    return response.data;
  }
}
