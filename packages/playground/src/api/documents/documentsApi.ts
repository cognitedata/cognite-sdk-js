// Copyright 2020 Cognite AS

import {
  BaseResourceAPI,
  CDFHttpClient,
  CursorAndAsyncIterator,
  ItemsWrapper,
  MetadataMap,
} from '@cognite/sdk-core';
import { PreviewAPI } from './previewApi';

import {
  Document,
  DocumentsAggregate,
  DocumentsRequestFilter, DocumentsSearchWrapper,
  ExternalDocumentsSearch,
} from '../../types';

export interface DocumentsAggregatesResponse<T> extends ItemsWrapper<T> {
  aggregates?: DocumentsAggregate[];
}

export class DocumentsAPI extends BaseResourceAPI<Document> {
  private readonly previewAPI: PreviewAPI;

  constructor(...args: [string, CDFHttpClient, MetadataMap]) {
    super(...args);

    const [baseUrl, httpClient, map] = args;
    this.previewAPI = new PreviewAPI(baseUrl + '/preview', httpClient, map);
  }

  public search = (
    query: ExternalDocumentsSearch
  ): Promise<DocumentsAggregatesResponse<DocumentsSearchWrapper[]>> => {
    return this.searchDocuments<DocumentsAggregatesResponse<DocumentsSearchWrapper[]>>(query);
  };

  public list = (
    scope?: DocumentsRequestFilter
  ): CursorAndAsyncIterator<Document> => {
    return this.listEndpoint(this.callListEndpointWithPost, scope);
  };

  public get preview() {
    return this.previewAPI;
  }

  private async searchDocuments<ResponseType>(
    query: ExternalDocumentsSearch
  ): Promise<ResponseType> {
    const response = await this.post<ResponseType>(this.searchUrl, {
      data: query,
    });

    return response.data;
  }
}
