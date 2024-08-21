// Copyright 2022 Cognite AS

import {
  BaseResourceAPI,
  type CDFHttpClient,
  type CogniteInternalId,
  type MetadataMap,
} from '@cognite/sdk-core';

import type {
  Document,
  DocumentListRequest,
  DocumentListResponse,
  DocumentSearchRequest,
  DocumentSearchResponse,
} from '../../types';

import { DocumentsAggregateAPI } from './aggregateApi';
import { PreviewAPI } from './previewApi';

export class DocumentsAPI extends BaseResourceAPI<Document> {
  private readonly previewAPI: PreviewAPI;
  private readonly aggregateAPI: DocumentsAggregateAPI;

  constructor(...args: [string, CDFHttpClient, MetadataMap]) {
    super(...args);

    const [baseUrl, httpClient, map] = args;
    this.previewAPI = new PreviewAPI(baseUrl, httpClient, map);
    this.aggregateAPI = new DocumentsAggregateAPI(
      `${baseUrl}/aggregate`,
      httpClient,
      map
    );
  }

  public get preview() {
    return this.previewAPI;
  }

  public get aggregate() {
    return this.aggregateAPI;
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

  public list = (request: DocumentListRequest): DocumentListResponse => {
    return this.listEndpoint(this.callListEndpointWithPost, request);
  };

  public content = (id: CogniteInternalId): Promise<string> => {
    return this.documentContent(id);
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
}
