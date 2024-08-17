// Copyright 2022 Cognite AS

import {
  BaseResourceAPI,
  type CursorResponse,
  type FilterQuery,
  type HttpResponse,
  type ItemsWrapper,
} from '@cognite/sdk-core';
import type {
  DocumentsAggregateAllUniquePropertiesItem,
  DocumentsAggregateAllUniquePropertiesRequest,
  DocumentsAggregateAllUniquePropertiesResponse,
  DocumentsAggregateAllUniqueValuesItem,
  DocumentsAggregateAllUniqueValuesRequest,
  DocumentsAggregateAllUniqueValuesResponse,
  DocumentsAggregateCountItem,
  DocumentsAggregateCountRequest,
  DocumentsAggregateRequest,
  DocumentsAggregateUniquePropertiesItem,
  DocumentsAggregateUniquePropertiesRequest,
  DocumentsAggregateUniqueValuesItem,
  DocumentsAggregateUniqueValuesRequest,
} from '../../types';

/**
 * Documents aggregate API.
 *
 * Note that only "allUniqueValues" requires pagination, and we therefore
 * configure the BaseResourceAPI to work for only that feature.
 */
export class DocumentsAggregateAPI extends BaseResourceAPI<unknown> {
  public count = (
    request: Omit<DocumentsAggregateCountRequest, 'aggregate'>,
  ): Promise<number> => {
    return this.aggregate<DocumentsAggregateCountItem>({
      ...request,
      aggregate: 'count',
    }).then((response) => response[0].count);
  };

  public uniqueValues = (
    request: Omit<DocumentsAggregateUniqueValuesRequest, 'aggregate'>,
  ): Promise<DocumentsAggregateUniqueValuesItem[]> => {
    return this.aggregate<DocumentsAggregateUniqueValuesItem>({
      ...request,
      aggregate: 'uniqueValues',
    });
  };

  public allUniqueValues = (
    request: Omit<DocumentsAggregateAllUniqueValuesRequest, 'aggregate'>,
  ): DocumentsAggregateAllUniqueValuesResponse => {
    return this.cursorBasedEndpoint<
      DocumentsAggregateAllUniqueValuesRequest,
      DocumentsAggregateAllUniqueValuesItem
    >(this.callAggregateCursorEndpointWithPost, {
      ...request,
      aggregate: 'allUniqueValues',
    });
  };

  public uniqueProperties = (
    request: Omit<DocumentsAggregateUniquePropertiesRequest, 'aggregate'>,
  ): Promise<DocumentsAggregateUniquePropertiesItem[]> => {
    return this.aggregate<DocumentsAggregateUniquePropertiesItem>({
      ...request,
      aggregate: 'uniqueProperties',
    });
  };

  public allUniqueProperties = (
    request: Omit<DocumentsAggregateAllUniquePropertiesRequest, 'aggregate'>,
  ): DocumentsAggregateAllUniquePropertiesResponse => {
    return this.cursorBasedEndpoint<
      DocumentsAggregateAllUniquePropertiesRequest,
      DocumentsAggregateAllUniquePropertiesItem
    >(this.callAggregateCursorEndpointWithPost, {
      ...request,
      aggregate: 'allUniqueProperties',
    });
  };

  private callAggregateCursorEndpointWithPost = async <
    QueryType extends FilterQuery,
    Item,
  >(
    scope?: QueryType,
  ): Promise<HttpResponse<CursorResponse<Item[]>>> => {
    const response = await this.post<CursorResponse<Item[]>>(this.url(), {
      data: scope,
    });
    return response;
  };

  private async aggregate<Item>(
    request: DocumentsAggregateRequest,
  ): Promise<Item[]> {
    const response = await this.post<ItemsWrapper<Item[]>>(this.url(), {
      data: request,
    });
    return this.addToMapAndReturn(response.data.items, response);
  }
}
