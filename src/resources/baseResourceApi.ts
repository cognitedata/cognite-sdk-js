// Copyright 2019 Cognite AS

import { chunk } from 'lodash';
import { makeAutoPaginationMethods } from '../autoPagination';
import { HttpClient, HttpResponse } from '../httpClient';
import { MetadataMap } from '../metadata';
import {
  CursorResponse,
  FilterQuery,
  IdEither,
  ItemsResponse,
  ListResponse,
} from '../types/types';
import { transformDateInRequest, transformDateInResponse } from '../utils';
import { promiseAllWithData } from './assets/assetUtils';

export abstract class BaseResourceAPI<
  ResponseType,
  TransformedType,
  WrapperType extends TransformedType[]
> {
  constructor(
    public readonly httpClient: HttpClient,
    public readonly resourcePath: string,
    private map: MetadataMap
  ) {}

  public postAndTransformDates<
    RequestType,
    Response,
    ParamsType extends object = {}
  >(url: string, data?: RequestType, params?: ParamsType) {
    return this.httpClient
      .post<Response>(url, {
        data: { ...transformDateInRequest(data), ...params },
      })
      .then(this.transformDateInResponse);
  }

  protected getMetadataMap() {
    return this.map;
  }

  protected url(path: string = '') {
    return this.resourcePath + '/' + path;
  }

  protected listUrl() {
    return this.url('list');
  }

  protected byIdsUrl() {
    return this.url('byids');
  }

  protected updateUrl() {
    return this.url('update');
  }

  protected searchUrl() {
    return this.url('search');
  }

  protected deleteUrl() {
    return this.url('delete');
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

  protected listEndpoint<QueryType extends FilterQuery>(query?: QueryType) {
    const listPromise = this.callListEndpointWithPost<QueryType, ResponseType>(
      query
    )
      .then(response => ({
        ...response.data,
        items: this.transformToList(response.data.items),
      }))
      .then(transformedResponse =>
        this.addNextPageFunction<QueryType, TransformedType>(
          this.callListEndpointWithPost.bind(this),
          transformedResponse,
          query
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

  protected async deleteEndpoint<RequestParams extends object>(
    ids: IdEither[],
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

  protected async callListEndpointWithPost<
    QueryType extends FilterQuery,
    Response
  >(query?: QueryType) {
    return this.postAndTransformDates<QueryType, CursorResponse<Response>>(
      this.listUrl(),
      query
    );
  }

  protected async callRetrieveEndpoint(ids: IdEither[]) {
    return this.postInParallelWithAutomaticChunking(this.byIdsUrl(), ids);
  }

  protected async callUpdateEndpoint<ChangeType>(changes: ChangeType[]) {
    return this.postInParallelWithAutomaticChunking(this.updateUrl(), changes);
  }

  protected async callSearchEndpoint<QueryType, Response>(query: QueryType) {
    return this.postAndTransformDates<QueryType, Response>(
      this.searchUrl(),
      query
    );
  }

  protected callDeleteEndpoint<ParamsType extends object>(
    ids: IdEither[],
    params?: ParamsType
  ) {
    return this.postInParallelWithAutomaticChunking(
      this.deleteUrl(),
      ids,
      params
    );
  }

  protected addToMapAndReturn<T, R>(response: T, metadata: HttpResponse<R>) {
    return this.map.addAndReturn(response, metadata);
  }

  protected transformAndReturn(
    items: ResponseType[],
    metadata: HttpResponse<ItemsResponse<ResponseType>>
  ) {
    const transformedResponse = this.transformToClass(items);
    return this.addToMapAndReturn(transformedResponse, metadata);
  }

  protected async callEndpointWithMergeAndTransform<RequestType>(
    query: RequestType,
    requester: (
      request: RequestType
    ) => Promise<HttpResponse<ItemsResponse<ResponseType>>[]>,
    preRequestModifier?: (items: RequestType) => RequestType,
    postRequestModifier?: (items: ResponseType[]) => ResponseType[]
  ) {
    const modifiedQuery = this.applyIfApplicable(query, preRequestModifier);
    const responses = await requester.bind(this)(modifiedQuery);
    const mergedResponseItems = this.mergeItemsFromItemsResponse(responses);
    const modifiedResponseItems = this.applyIfApplicable(
      mergedResponseItems,
      postRequestModifier
    );
    return this.transformAndReturn(modifiedResponseItems, responses[0]);
  }

  protected async callEndpointWithTransform<RequestType>(
    query: RequestType,
    requester: (
      request: RequestType
    ) => Promise<HttpResponse<ItemsResponse<ResponseType>>>
  ) {
    const response = await requester.bind(this)(query);
    return this.transformAndReturn(response.data.items, response);
  }

  protected mergeItemsFromItemsResponse<T>(
    responses: HttpResponse<ItemsResponse<T>>[]
  ): T[] {
    return responses
      .map(response => response.data.items)
      .reduce((a, b) => [...a, ...b], []);
  }

  protected addNextPageFunction<QueryType extends FilterQuery, Response>(
    endpoint: ListEndpoint<QueryType, Response>,
    cursorResponse: CursorResponse<Response>,
    query: QueryType = {} as QueryType
  ): ListResponse<Response> {
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

  private applyIfApplicable<ArgumentType, ResultType>(
    args: ArgumentType,
    action?: (input: ArgumentType) => ResultType
  ) {
    if (action) {
      return action(args);
    }
    return args;
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
    ParamsType extends object = {}
  >(path: string, items: RequestType[], params?: ParamsType) {
    return promiseAllWithData(
      this.chunk(items, 1000),
      singleChunk =>
        this.postAndTransformDates<
          { items: RequestType[] },
          ItemsResponse<ResponseType>
        >(path, { items: singleChunk }, params),
      false
    );
  }

  private postInSequenceWithAutomaticChunking<
    RequestType,
    Response,
    ParamsType extends object = {}
  >(path: string, items: RequestType[], params?: ParamsType) {
    return promiseAllWithData(
      this.chunk(items, 1000),
      singleChunk =>
        this.postAndTransformDates<{ items: RequestType[] }, Response>(
          path,
          { items: singleChunk },
          params
        ),
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
