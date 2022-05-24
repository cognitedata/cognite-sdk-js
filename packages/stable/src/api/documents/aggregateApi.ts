// Copyright 2022 Cognite AS

import { BaseResourceAPI, CursorAndAsyncIterator } from '@cognite/sdk-core';

import {
  DocumentsAggregateRequest,
  DocumentsAggregateResponse,
  DocumentsAggregateCountRequest,
  DocumentsAggregateCountResponse,
  DocumentsAggregateUniqueValuesResponse,
  DocumentsAggregateAllUniqueValuesRequest,
  DocumentsAggregateAllUniqueValuesItem,
} from '../../types';

/**
 * Note that only "allUniqueValues" requires pagination, and we therefore
 * configure the BaseResourceAPI to work for only that feature.
 */
export class AggregateAPI extends BaseResourceAPI<DocumentsAggregateAllUniqueValuesItem> {
  public count = (
    request: DocumentsAggregateCountRequest
  ): Promise<DocumentsAggregateCountResponse> => {
    return this.aggregate<
      DocumentsAggregateCountRequest,
      DocumentsAggregateCountResponse
    >(request);
  };

  public uniqueValues = (
    request: DocumentsAggregateRequest
  ): Promise<DocumentsAggregateUniqueValuesResponse> => {
    return this.aggregate<
      DocumentsAggregateRequest,
      DocumentsAggregateUniqueValuesResponse
    >(request);
  };

  public allUniqueValues = (
    request: DocumentsAggregateAllUniqueValuesRequest
  ): CursorAndAsyncIterator<DocumentsAggregateAllUniqueValuesItem> => {
    return this.listEndpoint(this.callListEndpointWithPost, request);
  };

  private async aggregate<
    Request extends DocumentsAggregateRequest,
    Response extends DocumentsAggregateResponse
  >(request: Request): Promise<Response> {
    const response = await this.post<Response>(this.url(), {
      data: request,
    });
    return this.addToMapAndReturn(response.data, response);
  }
}
