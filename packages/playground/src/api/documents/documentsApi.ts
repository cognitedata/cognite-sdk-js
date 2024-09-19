// Copyright 2020 Cognite AS

import {
  BaseResourceAPI,
  type CDFHttpClient,
  type CursorAndAsyncIterator,
  type MetadataMap,
} from '@cognite/sdk-core';

import type {
  Document,
  DocumentContentResponse,
  DocumentId,
  DocumentsFilterRequest,
  DocumentsSearchRequest,
  DocumentsSearchResponse,
} from '../../types';

import { ClassifiersAPI } from './classifiersApi';
import { FeedbackAPI } from './feedbackApi';
import { PipelinesAPI } from './pipelinesApi';
import { PreviewAPI } from './previewApi';

export class DocumentsAPI extends BaseResourceAPI<Document> {
  readonly #feedbackAPI: FeedbackAPI;
  readonly #previewAPI: PreviewAPI;
  readonly #pipelinesAPI: PipelinesAPI;
  readonly #classifiersAPI: ClassifiersAPI;

  constructor(...args: [string, CDFHttpClient, MetadataMap]) {
    super(...args);

    const [baseUrl, httpClient, map] = args;
    this.#previewAPI = new PreviewAPI(`${baseUrl}/preview`, httpClient, map);
    this.#feedbackAPI = new FeedbackAPI(`${baseUrl}/feedback`, httpClient, map);
    this.#pipelinesAPI = new PipelinesAPI(
      `${baseUrl}/pipelines`,
      httpClient,
      map
    );
    this.#classifiersAPI = new ClassifiersAPI(
      `${baseUrl}/classifiers`,
      httpClient,
      map
    );
  }

  public search = (
    query: DocumentsSearchRequest
  ): Promise<DocumentsSearchResponse> => {
    return this.#searchDocuments<DocumentsSearchResponse>(query);
  };

  public list = (
    scope?: DocumentsFilterRequest
  ): CursorAndAsyncIterator<Document> => {
    return this.listEndpoint(this.callListEndpointWithPost, scope);
  };

  // https://docs.cognite.com/api/playground/#operation/documentsContent
  public content = (
    ids: DocumentId[],
    ignoreUnknownIds?: boolean
  ): Promise<DocumentContentResponse> => {
    return this.#documentContent<DocumentContentResponse>(
      ids,
      ignoreUnknownIds
    );
  };

  public get feedback() {
    return this.#feedbackAPI;
  }

  public get preview() {
    return this.#previewAPI;
  }

  public get pipelines() {
    return this.#pipelinesAPI;
  }

  public get classifiers() {
    return this.#classifiersAPI;
  }

  async #searchDocuments<ResponseType>(
    query: DocumentsSearchRequest
  ): Promise<ResponseType> {
    const response = await this.post<ResponseType>(this.searchUrl, {
      data: query,
    });

    return response.data;
  }

  async #documentContent<ResponseType>(
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
