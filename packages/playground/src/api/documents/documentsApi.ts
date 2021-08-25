// Copyright 2020 Cognite AS

import {
  BaseResourceAPI,
  CDFHttpClient,
  CursorAndAsyncIterator,
  InternalId,
  ItemsWrapper,
  MetadataMap,
} from '@cognite/sdk-core';
import { PreviewAPI } from './previewApi';

import {
  Document,
  DocumentContent,
  DocumentsAggregatesResponse,
  DocumentsRequestFilter,
  DocumentsSearchWrapper,
  ExternalDocumentsSearch,
} from '../../types';
import { FeedbackAPI } from './feedbackApi';

export class DocumentsAPI extends BaseResourceAPI<Document> {
  private readonly feedbackAPI: FeedbackAPI;
  private readonly previewAPI: PreviewAPI;

  constructor(...args: [string, CDFHttpClient, MetadataMap]) {
    super(...args);

    const [baseUrl, httpClient, map] = args;
    this.previewAPI = new PreviewAPI(baseUrl + '/preview', httpClient, map);
    this.feedbackAPI = new FeedbackAPI(baseUrl + '/feedback', httpClient, map);
  }

  public search = (
    query: ExternalDocumentsSearch
  ): Promise<DocumentsAggregatesResponse<DocumentsSearchWrapper[]>> => {
    return this.searchDocuments<
      DocumentsAggregatesResponse<DocumentsSearchWrapper[]>
    >(query);
  };

  public list = (
    scope?: DocumentsRequestFilter
  ): CursorAndAsyncIterator<Document> => {
    return this.listEndpoint(this.callListEndpointWithPost, scope);
  };

  // https://docs.cognite.com/api/playground/#operation/documentsContent
  public documentContent = (
    documentIds: InternalId[]
  ): Promise<ItemsWrapper<DocumentContent[]>> => {
    return this.documentContent<ItemsWrapper<DocumentContent[]>>(documentIds);
  };

  public get feedback() {
    return this.feedbackAPI;
  }

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

  private async documentContent<ResponseType>(
    documentIds: InternalId[]
  ): Promise<ResponseType> {
    const response = await this.post<ResponseType>(this.url() + '/content', {
      data: { items: documentIds },
    });
    return response.data;
  }
}
