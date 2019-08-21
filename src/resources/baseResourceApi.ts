// Copyright 2019 Cognite AS

import { chunk } from 'lodash';
import { HttpClient, HttpResponse } from '../httpClient';
import {
  CursorResponse,
  FilterQuery,
  IdEither,
  ItemsResponse,
  ListResponse
} from '../types/types';
import { transformDateInRequest, transformDateInResponse } from '../utils';
import { promiseAllWithData } from './assets/assetUtils';
import { MetadataMap } from '../metadata';
import { makeAutoPaginationMethods } from '../autoPagination';

export abstract class BaseResourceAPI<ResponseType, TransformedType, WrapperType extends Array<TransformedType>> {

  constructor(
    public readonly httpClient: HttpClient,
    public readonly resourcePath: string,
    private map: MetadataMap
  ) {}

  protected getMetadataMap() {
    return this.map;
  }

  protected url(path: string = '') {
    return this.resourcePath + '/' + path
  }

  protected listUrl() {
    return this.url('list');
  }

  protected byIdsUrl() {
    return this.url('byids');
  }

  protected searchUrl() {
    return this.url('search');
  }

  protected deleteUrl() {
    return this.url('delete');
  }

  protected updateUrl() {
    return this.url('update');
  }

  protected async callCreateEndpoint<RequestType, ResponseType>(
    items: RequestType[]
  ) {
    const responses = await this.postInSequenceWithAutomaticChunking<
      RequestType,
      ItemsResponse<ResponseType>
    >(this.url(), transformDateInRequest(items));
    return responses.map(transformDateInResponse);
  }

  protected async callListEndpointWithPost<
    QueryType extends FilterQuery,
    ResponseType
  >(query?: QueryType) {
    const response = await this.httpClient.post<CursorResponse<ResponseType>>(
      this.listUrl(),
      {
        data: transformDateInRequest(query),
      }
    );
    return transformDateInResponse(response);
  }

  protected callListEndpointWithThenAddCursorAndAsyncIterator<
    QueryType extends FilterQuery
  >(query?: QueryType) {
    const listPromise = this
      .callListEndpointWithPost<QueryType, ResponseType>(query)
      .then(response => ({
        ...response.data,
        items: this.transformToList(response.data.items),
      }))
      .then(transformedResponse =>
        this.addNextPageFunction<QueryType, TransformedType>(
          this.callListEndpointWithPost,
          transformedResponse,
          query
        )
      );
    const autoPaginationMethods = makeAutoPaginationMethods(listPromise);
    return Object.assign(listPromise, autoPaginationMethods);
  }
  
  protected abstract transformToClass(array: ResponseType[]): WrapperType;
  protected abstract transformToList(item: ResponseType[]): TransformedType[];


  protected async postEndpointinParalelWithAutomaticChunking<
    DataType,
    ParamsType extends object
  >(url: string, requestData: DataType[], params?: ParamsType) {
    const responses = await this.postInParallelWithAutomaticChunking<
      DataType,
      ItemsResponse<ResponseType>
    >(url, transformDateInRequest(requestData), params);
    return responses.map(this.transformDateInResponse);
  }

  protected async callRetrieveEndpoint(ids: IdEither[]) {
    return this.postEndpointinParalelWithAutomaticChunking(this.byIdsUrl(), ids);
  }

  protected async callUpdateEndpoint<ChangeType>(
    changes: ChangeType[]
  ) {
    return this.postEndpointinParalelWithAutomaticChunking(this.updateUrl(), changes);
  }

  protected callDeleteEndpoint<ParamsType extends object>(
    ids: IdEither[],
    params?: ParamsType
  ) {
    return this.postEndpointinParalelWithAutomaticChunking(this.deleteUrl(), ids, params);
  }

  protected async callSearchEndpoint<QueryType, ResponseType>(
    query: QueryType
  ) {
    const { httpClient } = this;
    const response = await httpClient.post<ItemsResponse<ResponseType>>(
      this.searchUrl(),
      {
        data: transformDateInRequest(query),
      }
    );
    return transformDateInResponse(response);
  }

  protected addToMapAndReturn<T, R>(response: T, metadata: HttpResponse<R>) {
    return this.map.addAndReturn(response, metadata);
  }

  protected transformAndReturn(items: ResponseType[], metadata: HttpResponse<ItemsResponse<ResponseType>>) {
    const transformedResponse = this.transformToClass(items);
    return this.addToMapAndReturn(transformedResponse, metadata);
  }

  private applyIfApplicable<ArgumentType, ResultType>(
    args: ArgumentType,
    action?: (input: ArgumentType) => ResultType
  ) {
    if(action) {
      return action(args);
    }
    return args;
  }

  protected async callEndpointWithMergeAndTransform<RequestType>(
    query: RequestType,
    requester: (request: RequestType) => Promise<HttpResponse<ItemsResponse<ResponseType>>[]>,
    preRequestModifier?: (items: RequestType) => RequestType,
    postRequestModifier?: (items: ResponseType[]) => ResponseType[]
  ) {
    const modifiedQuery = this.applyIfApplicable(query, preRequestModifier);
    const responses = await requester.bind(this)(modifiedQuery);
    const mergedResponseItems = this.mergeItemsFromItemsResponse(responses);
    const modifiedResponseItems = this.applyIfApplicable(mergedResponseItems, postRequestModifier);
    return this.transformAndReturn(modifiedResponseItems, responses[0]);
  }

  protected async callEndpointWithTransform<RequestType>(
    query: RequestType,
    requester: (request: RequestType) => Promise<HttpResponse<ItemsResponse<ResponseType>>>
  ) {
    const response = await requester.bind(this)(query);
    return this.transformAndReturn(response.data.items, response);
  }

  protected async callRetrieveWithMergeAndTransform(ids: IdEither[]) {
    return this.callEndpointWithMergeAndTransform(ids, this.callRetrieveEndpoint);
  }

  protected async callCreateWithPrePostModifiersMergeAndTransform<RequestType>(
    changes: RequestType[],
    preRequestModifier?: (items: RequestType[]) => RequestType[],
    postRequestModifier?: (items: ResponseType[]) => ResponseType[]) {
    return this.callEndpointWithMergeAndTransform(
      changes,
      this.callCreateEndpoint,
      preRequestModifier,
      postRequestModifier
    );
  }

  protected async callUpdateWithMergeAndTransform<ChangeType>(changes: ChangeType[]) {
    return this.callEndpointWithMergeAndTransform(changes, this.callUpdateEndpoint);
  }

  protected async callSearchWithTransform<FilterType>(query: FilterType) {
    return this.callEndpointWithTransform(query, this.callSearchEndpoint);
  }

  protected async callDelete<RequestParams extends object>(ids: IdEither[],params?: RequestParams) {
    const responses = await this.callDeleteEndpoint(ids, params);
    return this.addToMapAndReturn({}, responses[0]);
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
