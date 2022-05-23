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
  DocumentsAggregateRequest,
  DocumentsAggregateResponse,
  DocumentsAggregateCountRequest,
  DocumentsAggregateCountResponse,
  DocumentsAggregateUniqueValuesResponse,
  DocumentsAggregateAllUniqueValuesResponse,
  DocumentsAggregateAllUniqueValuesRequest,
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
    return this.documentContent(id);
  };

  public aggregateCount = (
    request: DocumentsAggregateCountRequest
  ): Promise<DocumentsAggregateCountResponse> => {
    return this.aggregate<
      DocumentsAggregateCountRequest,
      DocumentsAggregateCountResponse
    >(request);
  };

  public aggregateUniqueValues = (
    request: DocumentsAggregateRequest
  ): Promise<DocumentsAggregateUniqueValuesResponse> => {
    return this.aggregate<
      DocumentsAggregateRequest,
      DocumentsAggregateUniqueValuesResponse
    >(request);
  };

  public aggregateAllUniqueValues = (
    request: DocumentsAggregateAllUniqueValuesRequest
  ): Promise<DocumentsAggregateAllUniqueValuesResponse> => {
    return this.aggregate<
      DocumentsAggregateAllUniqueValuesRequest,
      DocumentsAggregateAllUniqueValuesResponse
    >(request);
  };

  private async searchDocuments<ResponseType>(
    query: DocumentSearchRequest
  ): Promise<ResponseType> {
    const response = await this.post<ResponseType>(this.searchUrl, {
      data: query,
    });

    return this.addToMapAndReturn(response.data, response);
  }

  private async documentContent(id: CogniteInternalId): Promise<string> {
    const response = await this.get<string>(this.url(`${id}/content`), {
      headers: {
        accept: 'text/plain',
      },
    });
    return response.data;
  }

  private async aggregate<
    Request extends DocumentsAggregateRequest,
    Response extends DocumentsAggregateResponse
  >(request: Request): Promise<Response> {
    const response = await this.post<Response>(this.url(`aggregate`), {
      data: request,
    });
    return this.addToMapAndReturn(response.data, response);
  }
}
