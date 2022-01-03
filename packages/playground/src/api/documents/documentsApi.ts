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
  DocumentContent,
  DocumentId,
  DocumentsAggregatesResponse,
  DocumentsRequestFilter,
  DocumentsSearchWrapper,
  ExternalDocumentsSearch,
} from '../../types';

import { PreviewAPI } from './previewApi';
import { FeedbackAPI } from './feedbackApi';
import { PipelinesAPI } from './pipelinesApi';
import { ClassifiersAPI } from './classifiersApi';

export class DocumentsAPI extends BaseResourceAPI<Document> {
  private readonly feedbackAPI: FeedbackAPI;
  private readonly previewAPI: PreviewAPI;
  private readonly pipelinesAPI: PipelinesAPI;
  private readonly classifiersAPI: ClassifiersAPI;

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
    this.classifiersAPI = new ClassifiersAPI(
      baseUrl + '/classifiers',
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

  // https://docs.cognite.com/api/playground/#operation/documentsContent
  public content = (
    ids: DocumentId[],
    ignoreUnknownIds?: boolean
  ): Promise<ItemsWrapper<DocumentContent[]>> => {
    return this.documentContent<ItemsWrapper<DocumentContent[]>>(
      ids,
      ignoreUnknownIds
    );
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

  public get classifiers() {
    return this.classifiersAPI;
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
    ids: DocumentId[],
    ignoreUnknownIds?: boolean
  ): Promise<ResponseType> {
    const documentIds = ids.map((id) => ({ id }));
    const response = await this.post<ResponseType>(this.url('content'), {
      data: {
        items: documentIds,
        ignoreUnknownIds,
      },
    });
    return response.data;
  }
}
