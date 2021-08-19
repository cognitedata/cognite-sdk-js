// Copyright 2020 Cognite AS

import {
  BaseResourceAPI,
  CDFHttpClient,
  CursorAndAsyncIterator,
  MetadataMap,
} from '@cognite/sdk-core';
import { PreviewAPI } from './previewApi';

import {
  Document,
  DocumentsAggregatesResponse,
  DocumentsRequestFilter,
  DocumentsSearchWrapper,
  ExternalDocumentsSearch,
} from '../../types';
import { FeedbackAPI } from './feedbackApi';
import { PipelinesAPI } from './pipelinesApi';

export class DocumentsAPI extends BaseResourceAPI<Document> {
  private readonly feedbackAPI: FeedbackAPI;
  private readonly previewAPI: PreviewAPI;
  private readonly pipelinesAPI: PipelinesAPI;

  constructor(...args: [string, CDFHttpClient, MetadataMap]) {
    super(...args);

    const [baseUrl, httpClient, map] = args;
    this.previewAPI = new PreviewAPI(baseUrl + '/preview', httpClient, map);
    this.feedbackAPI = new FeedbackAPI(baseUrl + '/feedback', httpClient, map);
    this.pipelinesAPI = new PipelinesAPI(
      baseUrl + '/pipelines',
      httpClient,
      map
    );
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

  public get feedback() {
    return this.feedbackAPI;
  }

  public get preview() {
    return this.previewAPI;
  }

  public get pipelines() {
    return this.pipelinesAPI;
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
