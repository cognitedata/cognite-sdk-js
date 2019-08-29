// Copyright 2019 Cognite AS

import { CursorAndAsyncIterator } from '@/standardMethods';
import { applyIfApplicable } from '@/utils';
import { HttpResponse } from '@/utils/http/basicHttpClient';
import { CDFHttpClient } from '@/utils/http/cdfHttpClient';
import { chunk } from 'lodash';
import { makeAutoPaginationMethods } from '../autoPagination';
import { MetadataMap } from '../metadata';
import {
  CursorResponse,
  FilterQuery,
  IdEither,
  ItemsResponse,
  ListResponse,
} from '../types/types';
import { promiseAllWithData } from './assets/assetUtils';

export abstract class BaseResourceAPI<
  ResponseType,
  TransformedType = ResponseType,
  WrapperType extends TransformedType[] = TransformedType[]
> {
  protected get listGetUrl() {
    return this.url('');
  }

  protected get listPostUrl() {
    return this.url('list');
  }

  protected get byIdsUrl() {
    return this.url('byids');
  }

  protected get updateUrl() {
    return this.url('update');
  }

  protected get searchUrl() {
    return this.url('search');
  }

  protected get deleteUrl() {
    return this.url('delete');
  }

  protected static chunk<T>(items: T[], chunkSize: number): T[][] {
    if (items.length === 0) {
      return [[]];
    }
    return chunk(items, chunkSize);
  }
  constructor(
    public readonly resourcePath: string,
    public readonly httpClient: CDFHttpClient,
    private map: MetadataMap
  ) {}

  protected getMetadataMap() {
    return this.map;
  }

  protected url(path: string = '') {
    return this.resourcePath + '/' + path;
  }

  protected async createEndpoint<RequestType>(
    items: RequestType[],
    preRequestModifier?: (items: RequestType[]) => RequestType[],
    postRequestModifier?: (items: ResponseType[]) => ResponseType[]
  ) {
    return this.callEndpointWithMergeAndTransform(
      items,
      this.callCreateEndpoint,
      preRequestModifier,
      postRequestModifier
    );
  }

  protected listEndpoint<QueryType extends FilterQuery>(
    endpointCaller: ListEndpoint<QueryType, WrapperType>,
    scope?: QueryType
  ): CursorAndAsyncIterator<TransformedType, WrapperType> {
    const listPromise = endpointCaller(scope).then(transformedResponse =>
      this.addNextPageFunction<QueryType>(
        endpointCaller.bind(this),
        transformedResponse.data,
        scope
      )
    );
    const autoPaginationMethods = makeAutoPaginationMethods(listPromise);
    return Object.assign(listPromise, autoPaginationMethods);
  }

  protected async retrieveEndpoint(ids: IdEither[]) {
    return this.callEndpointWithMergeAndTransform(
      ids,
      this.callRetrieveEndpoint
    );
  }

  protected async updateEndpoint<ChangeType>(changes: ChangeType[]) {
    return this.callEndpointWithMergeAndTransform(
      changes,
      this.callUpdateEndpoint
    );
  }

  protected async searchEndpoint<FilterType>(query: FilterType) {
    return this.callEndpointWithTransform(query, this.callSearchEndpoint);
  }

  protected async deleteEndpoint<RequestParams extends object, T = IdEither>(
    ids: T[],
    params?: RequestParams
  ) {
    const responses = await this.callDeleteEndpoint(ids, params);
    return this.addToMapAndReturn({}, responses[0]);
  }

  protected async callCreateEndpoint<RequestType>(items: RequestType[]) {
    return this.postInSequenceWithAutomaticChunking<
      RequestType,
      ItemsResponse<ResponseType>
    >(this.url(), items);
  }

  protected callListEndpointWithGet = async <QueryType extends FilterQuery>(
    scope?: QueryType
  ): Promise<HttpResponse<CursorResponse<WrapperType>>> => {
    const response = await this.httpClient.get<CursorResponse<ResponseType[]>>(
      this.listGetUrl,
      {
        params: scope,
      }
    );
    return this.transformResponse(response);
  };

  protected callListEndpointWithPost = async <QueryType extends FilterQuery>(
    scope?: QueryType
  ): Promise<HttpResponse<CursorResponse<WrapperType>>> => {
    const response = await this.httpClient.post<CursorResponse<ResponseType[]>>(
      this.listPostUrl,
      {
        data: scope || {},
      }
    );
    return this.transformResponse(response);
  };

  protected async callRetrieveEndpoint(ids: IdEither[]) {
    return this.postInParallelWithAutomaticChunking(this.byIdsUrl, ids);
  }

  protected async callUpdateEndpoint<ChangeType>(changes: ChangeType[]) {
    return this.postInParallelWithAutomaticChunking(this.updateUrl, changes);
  }

  protected async callSearchEndpoint<QueryType, Response>(query: QueryType) {
    return this.httpClient.post<Response>(this.searchUrl, { data: query });
  }

  protected callDeleteEndpoint<ParamsType extends object, T = IdEither>(
    ids: T[],
    params?: ParamsType
  ) {
    return this.postInParallelWithAutomaticChunking(
      this.deleteUrl,
      ids,
      params
    );
  }

  protected addToMapAndReturn<T, R>(response: T, metadata: HttpResponse<R>) {
    return this.map.addAndReturn(response, metadata);
  }

  protected transformAndReturn(
    items: ResponseType[],
    metadata: HttpResponse<ItemsResponse<ResponseType[]>>
  ) {
    const transformedResponse = this.transformToClass(items);
    return this.addToMapAndReturn(transformedResponse, metadata);
  }

  protected async callEndpointWithMergeAndTransform<RequestType>(
    query: RequestType,
    requester: (
      request: RequestType
    ) => Promise<HttpResponse<ItemsResponse<ResponseType[]>>[]>,
    preRequestModifier?: (items: RequestType) => RequestType,
    postRequestModifier?: (items: ResponseType[]) => ResponseType[]
  ) {
    const modifiedQuery = applyIfApplicable(query, preRequestModifier);
    const responses = await requester.bind(this)(modifiedQuery);
    const mergedResponseItems = this.mergeItemsFromItemsResponse(responses);
    const modifiedResponseItems = applyIfApplicable(
      mergedResponseItems,
      postRequestModifier
    );
    return this.transformAndReturn(modifiedResponseItems, responses[0]);
  }

  protected async callEndpointWithTransform<RequestType>(
    query: RequestType,
    requester: (
      request: RequestType
    ) => Promise<HttpResponse<ItemsResponse<ResponseType[]>>>
  ) {
    const response = await requester.bind(this)(query);
    return this.transformAndReturn(response.data.items, response);
  }

  protected mergeItemsFromItemsResponse<T>(
    responses: HttpResponse<ItemsResponse<T[]>>[]
  ): T[] {
    return responses
      .map(response => response.data.items)
      .reduce((a, b) => [...a, ...b], []);
  }

  protected addNextPageFunction<QueryType extends FilterQuery>(
    endpoint: ListEndpoint<QueryType, WrapperType>,
    cursorResponse: CursorResponse<WrapperType>,
    query: QueryType = {} as QueryType
  ): ListResponse<WrapperType> {
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

  protected abstract transformToClass(array: ResponseType[]): WrapperType;
  protected abstract transformToList(item: ResponseType[]): TransformedType[];

  protected postInParallelWithAutomaticChunking<
    RequestType,
    ParamsType extends object = {}
  >(path: string, items: RequestType[], params?: ParamsType) {
    return promiseAllWithData(
      BaseResourceAPI.chunk(items, 1000),
      singleChunk =>
        this.httpClient.post<ItemsResponse<ResponseType[]>>(path, {
          data: { ...params, items: singleChunk },
        }),
      false
    );
  }

  private transformResponse(
    response: HttpResponse<ItemsResponse<ResponseType[]>>
  ): HttpResponse<ItemsResponse<WrapperType>> {
    const transformedResponse = {
      ...response,
      data: {
        ...response.data,
        items: this.transformToClass(response.data.items),
      },
    };
    return transformedResponse;
  }

  private postInSequenceWithAutomaticChunking<
    RequestType,
    ParamsType extends object = {}
  >(path: string, items: RequestType[], params?: ParamsType) {
    return promiseAllWithData(
      BaseResourceAPI.chunk(items, 1000),
      singleChunk =>
        this.httpClient.post<ItemsResponse<ResponseType[]>>(path, {
          data: { items: singleChunk },
          params,
        }),
      true
    );
  }
}

type ListEndpoint<QueryType extends FilterQuery, WrapperType> = (
  query?: QueryType
) => Promise<HttpResponse<CursorResponse<WrapperType>>>;
