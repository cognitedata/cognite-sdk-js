// Copyright 2020 Cognite AS

import {
  BaseResourceAPI,
  CDFHttpClient,
  CursorAndAsyncIterator,
  ItemsWrapper,
  MetadataMap,
} from '@cognite/sdk-core';

import {
  Document,
  DocumentsAggregate,
  DocumentsRequestFilter,
  ExternalDocumentsSearch,
} from '../../types';
import { FeedbackAPI } from './feedbackApi';
import { PipelinesAPI } from './pipelinesApi';

export interface DocumentsAggregatesResponse<T> extends ItemsWrapper<T> {
  aggregates?: DocumentsAggregate[];
}

export class DocumentsAPI extends BaseResourceAPI<Document> {
  private readonly feedbackAPI: FeedbackAPI;
  private readonly pipelinesAPI: PipelinesAPI;

  constructor(...args: [string, CDFHttpClient, MetadataMap]) {
    super(...args);

    this.feedbackAPI = new FeedbackAPI(args[0] + '/feedback', args[1], args[2]);
    this.pipelinesAPI = new PipelinesAPI(
      args[0] + '/pipelines',
      args[1],
      args[2]
    );
  }

  public search = (
    query: ExternalDocumentsSearch
  ): Promise<DocumentsAggregatesResponse<Document>> => {
    return this.searchDocuments<DocumentsAggregatesResponse<Document>>(query);
  };

  public list = (
    scope?: DocumentsRequestFilter
  ): CursorAndAsyncIterator<Document> => {
    return super.listEndpoint(this.callListEndpointWithPost, scope);
  };

  public get pipelines() {
    return this.pipelinesAPI;
  }

  public get feedback() {
    return this.feedbackAPI;
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
