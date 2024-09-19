// Copyright 2020 Cognite AS

import chunk from 'lodash/chunk';
import { makeAutoPaginationMethods } from './autoPagination';
import DateParser from './dateParser';
import type {
  HttpCall,
  HttpQueryParams,
  HttpRequestOptions,
  HttpResponse,
} from './httpClient/basicHttpClient';
import type { CDFHttpClient } from './httpClient/cdfHttpClient';
import type { MetadataMap } from './metadata';
import type {
  CursorAndAsyncIterator,
  CursorResponse,
  FilterQuery,
  IdEither,
  ItemsWrapper,
  ListResponse,
} from './types';
import { applyIfApplicable, promiseAllWithData } from './utils';

/** @hidden */
export abstract class BaseResourceAPI<ResponseType> {
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

  protected get upsertUrl() {
    return this.url('upsert');
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

  protected readonly dateParser: DateParser;

  /** @hidden */
  constructor(
    private readonly _resourcePath: string,
    private readonly _httpClient: CDFHttpClient,
    private _map: MetadataMap
  ) {
    this.dateParser = new DateParser(...this.getDateProps());
  }

  protected getMetadataMap() {
    return this._map;
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

  protected url(path = '') {
    return `${this._resourcePath}/${path}`;
  }

  #requestWrapper(request: HttpCall) {
    return async <ResponseType>(
      path: string,
      options?: HttpRequestOptions
    ): Promise<HttpResponse<ResponseType>> => {
      const requestOptions =
        options !== undefined
          ? {
              ...options,
              params: DateParser.parseFromDates(options.params),
              data: DateParser.parseFromDates(options.data),
            }
          : undefined;
      const response = await request<ResponseType>(path, requestOptions);
      return {
        ...response,
        data: this.dateParser.parseToDates(response.data),
      };
    };
  }

  protected get = this.#requestWrapper(
    this._httpClient.get.bind(this._httpClient)
  );
  protected post = this.#requestWrapper(
    this._httpClient.post.bind(this._httpClient)
  );
  protected put = this.#requestWrapper(
    this._httpClient.put.bind(this._httpClient)
  );

  protected async createEndpoint<RequestType>(
    items: RequestType[],
    path: string = this.url(),
    preRequestModifier?: (items: RequestType[]) => RequestType[],
    postRequestModifier?: (items: ResponseType[]) => ResponseType[]
  ) {
    return this.callEndpointWithMergeAndTransform(
      items,
      (data) => this.#callCreateEndpoint(data, path),
      preRequestModifier,
      postRequestModifier
    );
  }

  protected async upsertEndpoint<RequestType>(
    items: RequestType[],
    preRequestModifier?: (items: RequestType[]) => RequestType[],
    postRequestModifier?: (items: ResponseType[]) => ResponseType[]
  ) {
    return this.callEndpointWithMergeAndTransform(
      items,
      (data) => this.#callUpsertEndpoint(data),
      preRequestModifier,
      postRequestModifier
    );
  }

  protected cursorBasedEndpoint<QueryType extends FilterQuery, Item>(
    endpointCaller: ListEndpoint<QueryType, Item[]>,
    scope?: QueryType
  ): CursorAndAsyncIterator<Item> {
    const listPromise = endpointCaller(scope).then((transformedResponse) =>
      this.addNextPageFunction<QueryType, Item>(
        endpointCaller.bind(this),
        transformedResponse.data,
        scope
      )
    );
    const autoPaginationMethods = makeAutoPaginationMethods(listPromise);
    return Object.assign(listPromise, autoPaginationMethods);
  }

  protected listEndpoint<QueryType extends FilterQuery>(
    endpointCaller: ListEndpoint<QueryType, ResponseType[]>,
    scope?: QueryType
  ): CursorAndAsyncIterator<ResponseType> {
    return this.cursorBasedEndpoint<QueryType, ResponseType>(
      endpointCaller,
      scope
    );
  }

  protected async retrieveEndpoint<
    RequestParams extends HttpQueryParams,
    T = IdEither,
  >(
    ids: T[],
    params?: RequestParams,
    path?: string,
    queryParams?: RequestParams
  ) {
    return this.callEndpointWithMergeAndTransform(ids, (request) =>
      this.callRetrieveEndpoint<RequestParams, T>(
        request,
        path,
        params,
        queryParams
      )
    );
  }

  protected async updateEndpoint<ChangeType>(
    changes: ChangeType[],
    path?: string
  ) {
    return this.callEndpointWithMergeAndTransform(changes, (data) =>
      this.callUpdateEndpoint(data, path)
    );
  }

  protected async searchEndpoint<FilterType>(
    query: FilterType,
    path?: string,
    queryParams?: HttpQueryParams
  ) {
    return this.callEndpointWithTransform(query, (data) =>
      this.callSearchEndpoint(data, path, queryParams)
    );
  }

  protected async deleteEndpoint<
    RequestParams extends HttpQueryParams,
    T = IdEither,
  >(ids: T[], params?: RequestParams, path?: string) {
    const responses = await this.callDeleteEndpoint(ids, params, path);
    return this.addToMapAndReturn({}, responses[0]);
  }

  protected async aggregateEndpoint<QueryType, AggregateResponse>(
    query: QueryType,
    path?: string
  ) {
    const response = await this.callAggregateEndpoint<
      QueryType,
      AggregateResponse
    >(query, path);
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

  protected async callRetrieveEndpoint<
    RequestParams extends HttpQueryParams,
    T = IdEither,
  >(
    items: T[],
    path: string = this.byIdsUrl,
    params?: RequestParams,
    queryParams?: RequestParams
  ) {
    return this.postInParallelWithAutomaticChunking({
      params,
      path,
      items,
      queryParams,
    });
  }

  protected async callUpdateEndpoint<ChangeType>(
    changes: ChangeType[],
    path: string = this.updateUrl
  ) {
    return this.postInParallelWithAutomaticChunking({ path, items: changes });
  }

  protected async callSearchEndpoint<QueryType, Response>(
    query: QueryType,
    path: string = this.searchUrl,
    queryParams?: HttpQueryParams
  ) {
    return this.post<Response>(path, { data: query, params: queryParams });
  }

  protected callDeleteEndpoint<
    ParamsType extends HttpQueryParams,
    T = IdEither,
  >(ids: T[], params?: ParamsType, path: string = this.deleteUrl) {
    return this.postInParallelWithAutomaticChunking({
      path,
      items: ids,
      params,
    });
  }

  protected async callAggregateEndpoint<QueryType, AggregateResponse>(
    query: QueryType,
    path: string = this.aggregateUrl
  ) {
    return this.post<ItemsWrapper<AggregateResponse[]>>(path, {
      data: query,
    });
  }

  protected addToMapAndReturn<T extends object, R>(
    response: T,
    metadata: HttpResponse<R>
  ) {
    return this._map.addAndReturn(response, metadata);
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
    return this.addToMapAndReturn(modifiedResponseItems, responses[0]);
  }

  protected async callEndpointWithTransform<RequestType>(
    query: RequestType,
    requester: (
      request: RequestType
    ) => Promise<HttpResponse<ItemsWrapper<ResponseType[]>>>
  ) {
    const response = await requester.bind(this)(query);
    return this.addToMapAndReturn(response.data.items, response);
  }

  protected mergeItemsFromItemsResponse<T>(
    responses: HttpResponse<ItemsWrapper<T[]>>[]
  ): T[] {
    return responses
      .map((response) => response.data.items)
      .reduce((acc, cur) => {
        acc.push(...cur);
        return acc;
      }, []);
  }

  protected addNextPageFunction<QueryType extends FilterQuery, Item>(
    endpoint: ListEndpoint<QueryType, Item[]>,
    cursorResponse: CursorResponse<Item[]>,
    query: QueryType = {} as QueryType
  ): ListResponse<Item[]> {
    const { nextCursor } = cursorResponse;
    const next = nextCursor
      ? () =>
          endpoint({ ...query, cursor: nextCursor }).then((response) =>
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
    ParamsType extends HttpQueryParams,
  >({
    path,
    items,
    params,
    queryParams,
    chunkSize = 1000,
  }: PostInParallelWithAutomaticChunkingParams<RequestType, ParamsType>) {
    return promiseAllWithData(
      BaseResourceAPI.chunk(items, chunkSize),
      (singleChunk) =>
        this.post<ItemsWrapper<ResponseType[]>>(path, {
          data: { ...params, items: singleChunk },
          params: queryParams,
        }),
      false
    );
  }

  async #callCreateEndpoint<RequestType>(items: RequestType[], path: string) {
    return this.#postInSequenceWithAutomaticChunking<RequestType>(path, items);
  }

  async #callUpsertEndpoint<RequestType>(
    items: RequestType[],
    path: string = this.upsertUrl
  ) {
    return this.#postInSequenceWithAutomaticChunking<RequestType>(path, items);
  }

  #postInSequenceWithAutomaticChunking<RequestType>(
    path: string,
    items: RequestType[],
    params?: HttpQueryParams
  ) {
    return promiseAllWithData(
      BaseResourceAPI.chunk(items, 1000),
      (singleChunk) =>
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

type NoInfer<T> = [T][T extends unknown ? 0 : never];
