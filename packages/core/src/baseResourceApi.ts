// Copyright 2020 Cognite AS

import chunk from 'lodash/chunk';
import { makeAutoPaginationMethods } from './autoPagination';
import {
  HttpResponse,
  HttpRequestOptions,
  HttpCall,
} from './httpClient/basicHttpClient';
import { CDFHttpClient } from './httpClient/cdfHttpClient';
import { MetadataMap } from './metadata';
import {
  CursorAndAsyncIterator,
  CursorResponse,
  EmptyResponse,
  FilterQuery,
  IdEither,
  ItemsWrapper,
  ListResponse,
} from './types';
import { applyIfApplicable, promiseAllWithData } from './utils';
import DateParser from './dateParser';
/** @hidden */
export abstract class BaseResourceAPI<ResponseType> {
  protected get listGetUrl(): string {
    return this.url('');
  }

  protected get listPostUrl(): string {
    return this.url('list');
  }

  protected get byIdsUrl(): string {
    return this.url('byids');
  }

  protected get updateUrl(): string {
    return this.url('update');
  }

  protected get searchUrl(): string {
    return this.url('search');
  }

  protected get deleteUrl(): string {
    return this.url('delete');
  }

  protected get aggregateUrl(): string {
    return this.url('aggregate');
  }

  protected static chunk<T>(items: T[], chunkSize: number): T[][] {
    if (items.length === 0) {
      return [[]];
    }
    return chunk(items, chunkSize);
  }

  protected readonly dateParser: DateParser;

  /** @hidden */
  constructor(
    private readonly resourcePath: string,
    private readonly httpClient: CDFHttpClient,
    private map: MetadataMap
  ) {
    this.dateParser = new DateParser(...this.getDateProps());
  }

  protected getMetadataMap(): MetadataMap {
    return this.map;
  }

  /**
   * Specifies what fields in http json responses can
   * be parsed as numbers of milliseconds since unix epoch,
   * and be converted into Date objects.
   */
  protected getDateProps(): [string[], string[]] {
    return [[], []];
  }

  /**
   * Helper for getDateProps(...)
   *
   * @param parents list of parent property names (recursively)
   * @param props list of unix timestamp properties to be converted
   */
  protected pickDateProps<T = ResponseType>(
    parents: string[],
    props: NonNullable<KeysOfType<NoInfer<T>, Date | undefined>>[]
  ): [string[], string[]] {
    return [parents, props as string[]];
  }

  protected url(path = ''): string {
    return this.resourcePath + '/' + path;
  }

  private requestWrapper(request: HttpCall) {
    return async <ResponseType>(
      path: string,
      options?: HttpRequestOptions
    ): Promise<HttpResponse<ResponseType>> => {
      if (options !== undefined)
        options = {
          ...options,
          params: DateParser.parseFromDates(options.params),
          data: DateParser.parseFromDates(options.data),
        };
      const response = await request<ResponseType>(path, options);
      return {
        ...response,
        data: this.dateParser.parseToDates(response.data),
      };
    };
  }

  protected get = this.requestWrapper(
    this.httpClient.get.bind(this.httpClient)
  );
  protected post = this.requestWrapper(
    this.httpClient.post.bind(this.httpClient)
  );
  protected put = this.requestWrapper(
    this.httpClient.put.bind(this.httpClient)
  );

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
    endpointCaller: ListEndpoint<QueryType, ResponseType[]>,
    scope?: QueryType
  ): CursorAndAsyncIterator<ResponseType> {
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
    return this.addToMapAndReturn(EmptyResponse, responses[0]);
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
  ): Promise<HttpResponse<CursorResponse<ResponseType[]>>> => {
    const response = await this.get<CursorResponse<ResponseType[]>>(
      this.listGetUrl,
      {
        params: scope,
      }
    );
    return response;
  };

  protected callListEndpointWithPost = async <QueryType extends FilterQuery>(
    scope?: QueryType
  ): Promise<HttpResponse<CursorResponse<ResponseType[]>>> => {
    const response = await this.post<CursorResponse<ResponseType[]>>(
      this.listPostUrl,
      {
        data: scope || {},
      }
    );
    return response;
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
    return this.post<Response>(this.searchUrl, { data: query });
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
    return this.post<ItemsWrapper<AggregateResponse[]>>(this.aggregateUrl, {
      data: query,
    });
  }

  protected addToMapAndReturn<T, R>(response: T, metadata: HttpResponse<R>): T {
    return this.map.addAndReturn(response, metadata);
  }

  protected async callEndpointWithMergeAndTransform<RequestType>(
    query: RequestType,
    requester: (
      request: RequestType
    ) => Promise<HttpResponse<ItemsWrapper<ResponseType[]>>[]>,
    preRequestModifier?: (items: RequestType) => RequestType,
    postRequestModifier?: (items: ResponseType[]) => ResponseType[]
  ): Promise<ResponseType[]> {
    const modifiedQuery = applyIfApplicable(query, preRequestModifier);
    const responses = await requester.bind(this)(modifiedQuery);
    const mergedResponseItems = this.mergeItemsFromItemsResponse(responses);
    const modifiedResponseItems = applyIfApplicable(
      mergedResponseItems,
      postRequestModifier
    );
    return this.addToMapAndReturn(modifiedResponseItems, responses[0]);
  }

  protected async callEndpointWithTransform<RequestType>(
    query: RequestType,
    requester: (
      request: RequestType
    ) => Promise<HttpResponse<ItemsWrapper<ResponseType[]>>>
  ): Promise<ResponseType[]> {
    const response = await requester.bind(this)(query);
    return this.addToMapAndReturn(response.data.items, response);
  }

  protected mergeItemsFromItemsResponse<T>(
    responses: HttpResponse<ItemsWrapper<T[]>>[]
  ): T[] {
    return responses
      .map(response => response.data.items)
      .reduce((a, b) => [...a, ...b], []);
  }

  protected addNextPageFunction<QueryType extends FilterQuery>(
    endpoint: ListEndpoint<QueryType, ResponseType[]>,
    cursorResponse: CursorResponse<ResponseType[]>,
    query: QueryType = {} as QueryType
  ): ListResponse<ResponseType[]> {
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
        this.post<ItemsWrapper<ResponseType[]>>(path, {
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

  private postInSequenceWithAutomaticChunking<
    RequestType,
    ParamsType extends object = {}
  >(path: string, items: RequestType[], params?: ParamsType) {
    return promiseAllWithData(
      BaseResourceAPI.chunk(items, 1000),
      singleChunk =>
        this.post<ItemsWrapper<ResponseType[]>>(path, {
          data: { items: singleChunk },
          params,
        }),
      true
    );
  }
}

type ListEndpoint<QueryType extends FilterQuery, ResponseType> = (
  query?: QueryType
) => Promise<HttpResponse<CursorResponse<ResponseType>>>;

interface PostInParallelWithAutomaticChunkingParams<RequestType, ParamsType> {
  path: string;
  items: RequestType[];
  params?: ParamsType;
  queryParams?: ParamsType;
  chunkSize?: number;
}

type KeysOfType<T, U> = { [P in keyof T]: T[P] extends U ? P : never }[keyof T];

type NoInfer<T> = [T][T extends any ? 0 : never];
