// Copyright 2019 Cognite AS

import { chunk } from 'lodash';
import { HttpClient, HttpResponse } from '../httpClient';
import {
  CursorResponse,
  FilterQuery,
  IdEither,
  ItemsResponse,
  ListResponse,
} from '../types/types';
import { transformDateInRequest, transformDateInResponse } from '../utils';
import { promiseAllWithData } from './assets/assetUtils';

export abstract class BaseResourceAPI {
  constructor(
    public readonly httpClient: HttpClient,
    public readonly resourcePath: string
  ) {}

  protected async callCreateEndpoint<RequestType, ResponseType>(
    items: RequestType[]
  ) {
    const { resourcePath } = this;
    const responses = await this.postInSequenceWithAutomaticChunking<
      RequestType,
      ItemsResponse<ResponseType>
    >(resourcePath, transformDateInRequest(items));
    return responses.map(transformDateInResponse);
  }

  protected async callListEndpointWithPost<
    QueryType extends FilterQuery,
    ResponseType
  >(query?: QueryType) {
    const response = await this.httpClient.post<CursorResponse<ResponseType>>(
      `${this.resourcePath}/list`,
      {
        data: transformDateInRequest(query),
      }
    );
    return transformDateInResponse(response);
  }

  protected async callRetrieveEndpoint<ResponseType>(ids: IdEither[]) {
    const { resourcePath } = this;
    const responses = await this.postInParallelWithAutomaticChunking<
      IdEither,
      ItemsResponse<ResponseType>
    >(`${resourcePath}/byids`, ids);
    return responses.map(this.transformDateInResponse);
  }

  protected async callUpdateEndpoint<ChangeType, ResponseType>(
    changes: ChangeType[]
  ) {
    const { resourcePath } = this;
    const responses = await this.postInParallelWithAutomaticChunking<
      ChangeType,
      ItemsResponse<ResponseType>
    >(`${resourcePath}/update`, transformDateInRequest(changes));
    return responses.map(this.transformDateInResponse);
  }

  protected async callSearchEndpoint<QueryType, ResponseType>(
    query: QueryType
  ) {
    const { httpClient, resourcePath } = this;
    const response = await httpClient.post<ItemsResponse<ResponseType>>(
      `${resourcePath}/search`,
      {
        data: transformDateInRequest(query),
      }
    );
    return transformDateInResponse(response);
  }

  protected callDeleteEndpoint<ParamsType extends object>(
    ids: IdEither[],
    params?: ParamsType
  ) {
    const { resourcePath } = this;
    return this.postInParallelWithAutomaticChunking<IdEither, {}, ParamsType>(
      `${resourcePath}/delete`,
      ids,
      params
    );
  }

  protected mergeItemsFromItemsResponse<T>(
    responses: HttpResponse<ItemsResponse<T>>[]
  ): T[] {
    const itemsResponses = responses.map(response => response.data);
    return this.flattenItemsResponses(itemsResponses);
  }

  protected addNextPageFunction<QueryType extends FilterQuery, ResponseType>(
    endpoint: ListEndpoint<QueryType, ResponseType>,
    cursorResponse: CursorResponse<ResponseType>,
    query: QueryType = {} as QueryType
  ): ListResponse<ResponseType> {
    const { nextCursor } = cursorResponse;
    const next = nextCursor
      ? () =>
          endpoint({ ...query, cursor: nextCursor }).then(
            response => response.data
          )
      : undefined;
    return {
      ...cursorResponse,
      next,
    };
  }

  private flattenItemsResponses<T>(responses: ItemsResponse<T>[]): T[] {
    return responses
      .map(response => response.items)
      .reduce((a, b) => [...a, ...b], []);
  }

  private transformDateInResponse<T>(
    response: HttpResponse<T>
  ): HttpResponse<T> {
    return {
      ...response,
      data: transformDateInResponse(response.data),
    };
  }

  private postInParallelWithAutomaticChunking<
    RequestType,
    ResponseType,
    ParamsType extends object = {}
  >(path: string, items: RequestType[], params?: ParamsType) {
    const { httpClient } = this;
    return promiseAllWithData(
      this.chunk(items, 1000),
      singleChunk =>
        httpClient.post<ResponseType>(path, {
          data: { ...params, items: singleChunk },
        }),
      false
    );
  }

  private postInSequenceWithAutomaticChunking<
    RequestType,
    ResponseType,
    ParamsType extends object = {}
  >(path: string, items: RequestType[], params?: ParamsType) {
    const { httpClient } = this;
    return promiseAllWithData(
      this.chunk(items, 1000),
      singleChunk =>
        httpClient.post<ResponseType>(path, {
          data: { items: singleChunk },
          params,
        }),
      true
    );
  }

  private chunk<T>(items: T[], chunkSize: number): T[][] {
    if (items.length === 0) {
      return [[]];
    }
    return chunk(items, chunkSize);
  }
}

type ListEndpoint<QueryType extends FilterQuery, ResponseType> = (
  query?: QueryType
) => Promise<HttpResponse<CursorResponse<ResponseType>>>;
