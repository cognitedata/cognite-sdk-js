// Copyright 2020 Cognite AS

import { chunk } from 'lodash';
import { makeAutoPaginationMethods } from './autoPagination';
import { HttpResponse } from './httpClient/basicHttpClient';
import { CDFHttpClient } from './httpClient/cdfHttpClient';
import { MetadataMap } from './metadata';
import {
  CursorAndAsyncIterator,
  CursorResponse,
  FilterQuery,
  IdEither,
  ItemsWrapper,
  ListResponse,
} from './types';
import { applyIfApplicable, promiseAllWithData } from './utils';

/** @hidden */
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

  protected get aggregateUrl() {
    return this.url('aggregate');
  }

  protected static chunk<T>(items: T[], chunkSize: number): T[][] {
    if (items.length === 0) {
      return [[]];
    }
    return chunk(items, chunkSize);
  }

  /** @hidden */
  constructor(
    private readonly resourcePath: string,
    protected readonly httpClient: CDFHttpClient,
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
    path: string = this.url(),
    preRequestModifier?: (items: RequestType[]) => RequestType[],
    postRequestModifier?: (items: ResponseType[]) => ResponseType[]
  ) {
    return this.callEndpointWithMergeAndTransform(
      items,
      data => this.callCreateEndpoint(data, path),
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

  protected async retrieveEndpoint<RequestParams extends object>(
    ids: IdEither[],
    params?: RequestParams,
    path?: string
  ) {
    return this.callEndpointWithMergeAndTransform(ids, request =>
      this.callRetrieveEndpoint(request, path, params)
    );
  }

  protected async updateEndpoint<ChangeType>(
    changes: ChangeType[],
    path?: string
  ) {
    return this.callEndpointWithMergeAndTransform(changes, data =>
      this.callUpdateEndpoint(data, path)
    );
  }

  protected async searchEndpoint<FilterType>(query: FilterType) {
    return this.callEndpointWithTransform(query, this.callSearchEndpoint);
  }

  protected async deleteEndpoint<RequestParams extends object, T = IdEither>(
    ids: T[],
    params?: RequestParams,
    path?: string
  ) {
    const responses = await this.callDeleteEndpoint(ids, params, path);
    return this.addToMapAndReturn({}, responses[0]);
  }

  protected async aggregateEndpoint<QueryType, AggregateResponse>(
    query: QueryType
  ) {
    const response = await this.callAggregateEndpoint<
      QueryType,
      AggregateResponse
    >(query);
    return this.addToMapAndReturn(response.data.items, response);
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

  protected async callRetrieveEndpoint<RequestParams extends object>(
    items: IdEither[],
    path: string = this.byIdsUrl,
    params?: RequestParams
  ) {
    return this.postInParallelWithAutomaticChunking({ params, path, items });
  }

  protected async callUpdateEndpoint<ChangeType>(
    changes: ChangeType[],
    path: string = this.updateUrl
  ) {
    return this.postInParallelWithAutomaticChunking({ path, items: changes });
  }

  protected async callSearchEndpoint<QueryType, Response>(query: QueryType) {
    return this.httpClient.post<Response>(this.searchUrl, { data: query });
  }

  protected callDeleteEndpoint<ParamsType extends object, T = IdEither>(
    ids: T[],
    params?: ParamsType,
    path: string = this.deleteUrl
  ) {
    return this.postInParallelWithAutomaticChunking({
      path,
      items: ids,
      params,
    });
  }

  protected async callAggregateEndpoint<QueryType, AggregateResponse>(
    query: QueryType
  ) {
    return this.httpClient.post<ItemsWrapper<AggregateResponse[]>>(
      this.aggregateUrl,
      {
        data: query,
      }
    );
  }

  protected addToMapAndReturn<T, R>(response: T, metadata: HttpResponse<R>) {
    return this.map.addAndReturn(response, metadata);
  }

  protected transformAndReturn(
    items: ResponseType[],
    metadata: HttpResponse<ItemsWrapper<ResponseType[]>>
  ) {
    const transformedResponse = this.transformToClass(items);
    return this.addToMapAndReturn(transformedResponse, metadata);
  }

  protected async callEndpointWithMergeAndTransform<RequestType>(
    query: RequestType,
    requester: (
      request: RequestType
    ) => Promise<HttpResponse<ItemsWrapper<ResponseType[]>>[]>,
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
    ) => Promise<HttpResponse<ItemsWrapper<ResponseType[]>>>
  ) {
    const response = await requester.bind(this)(query);
    return this.transformAndReturn(response.data.items, response);
  }

  protected mergeItemsFromItemsResponse<T>(
    responses: HttpResponse<ItemsWrapper<T[]>>[]
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
          endpoint({ ...query, cursor: nextCursor }).then(response =>
            this.addNextPageFunction(endpoint, response.data, query)
          )
      : undefined;
    return {
      ...cursorResponse,
      next,
    };
  }

  protected transformToClass(array: ResponseType[]): WrapperType {
    return (array as unknown) as WrapperType;
  }
  protected transformToList(items: ResponseType[]): TransformedType[] {
    return (items as unknown) as TransformedType[];
  }

  protected postInParallelWithAutomaticChunking<
    RequestType,
    ParamsType extends object = {}
  >({
    path,
    items,
    params,
    queryParams,
    chunkSize = 1000,
  }: PostInParallelWithAutomaticChunkingParams<RequestType, ParamsType>) {
    return promiseAllWithData(
      BaseResourceAPI.chunk(items, chunkSize),
      singleChunk =>
        this.httpClient.post<ItemsWrapper<ResponseType[]>>(path, {
          data: { ...params, items: singleChunk },
          params: queryParams,
        }),
      false
    );
  }

  private async callCreateEndpoint<RequestType>(
    items: RequestType[],
    path: string
  ) {
    return this.postInSequenceWithAutomaticChunking<
      RequestType,
      ItemsWrapper<ResponseType>
    >(path, items);
  }

  private transformResponse(
    response: HttpResponse<ItemsWrapper<ResponseType[]>>
  ): HttpResponse<ItemsWrapper<WrapperType>> {
    return {
      ...response,
      data: {
        ...response.data,
        items: this.transformToClass(response.data.items),
      },
    };
  }

  private postInSequenceWithAutomaticChunking<
    RequestType,
    ParamsType extends object = {}
  >(path: string, items: RequestType[], params?: ParamsType) {
    return promiseAllWithData(
      BaseResourceAPI.chunk(items, 1000),
      singleChunk =>
        this.httpClient.post<ItemsWrapper<ResponseType[]>>(path, {
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

interface PostInParallelWithAutomaticChunkingParams<RequestType, ParamsType> {
  path: string;
  items: RequestType[];
  params?: ParamsType;
  queryParams?: ParamsType;
  chunkSize?: number;
}
