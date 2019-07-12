// Copyright 2019 Cognite AS

import { AxiosInstance } from 'axios';
import { chunk, concat } from 'lodash';
import {
  CogniteAsyncIterator,
  makeAutoPaginationMethods,
} from './autoPagination';
import { rawRequest } from './axiosWrappers';
import { MetadataMap } from './metadata';
import { promiseAllWithData } from './resources/assets/assetUtils';
import { CursorResponse, ItemsResponse } from './types/types';

type CreateEndpoint<RequestType, ResponseType> = (
  items: RequestType[]
) => Promise<ResponseType[]>;

/** @hidden */
export function generateCreateEndpoint<RequestType, ResponseType>(
  axiosInstance: AxiosInstance,
  resourcePath: string,
  metadataMap: MetadataMap,
  chunkFunction?: (items: RequestType[]) => RequestType[][]
): CreateEndpoint<RequestType, ResponseType> {
  return async function create(items) {
    type Response = ItemsResponse<ResponseType>;
    const chunks = doChunking<RequestType>(items, chunkFunction);

    // create a map that maps index in chunks to the original index in items (chunkFunction can change the order - assets)
    const itemIndex = new Map<RequestType, number>();
    items.forEach((item, index) => {
      itemIndex.set(item, index);
    });
    const chunkIndexToItemsIndex = new Map<number, number>();
    concat([], ...chunks).forEach((item, index) => {
      const originalIndex = itemIndex.get(item) as number;
      chunkIndexToItemsIndex.set(index, originalIndex);
    });

    const responses = await promiseAllWithData(
      chunks,
      input =>
        rawRequest<Response>(axiosInstance, {
          method: 'post',
          url: resourcePath,
          data: { items: input },
        }),
      true
    );
    const mergedResponses = concat(
      [],
      ...responses.map(response => response.data.items)
    );

    // make sure that the response has the same order as items (sortedResponse[index] should match items[index])
    const sortedResponse: ResponseType[] = [];
    mergedResponses.forEach((item, index) => {
      const originalIndex = chunkIndexToItemsIndex.get(index) as number;
      sortedResponse[originalIndex] = item;
    });
    return metadataMap.addAndReturn(sortedResponse, responses[0]);
  };
}

/** @hidden */
export function listByGet<RequestFilter, ResponseType>(
  axiosInstance: AxiosInstance,
  resourcePath: string,
  filter: RequestFilter
) {
  return rawRequest<CursorResponse<ResponseType>>(
    axiosInstance,
    {
      method: 'get',
      url: resourcePath,
      params: filter,
    },
    true
  );
}

/** @hidden */
export function listByPost<RequestFilter, ResponseType>(
  axiosInstance: AxiosInstance,
  resourcePath: string,
  filter: RequestFilter
) {
  return rawRequest<CursorResponse<ResponseType>>(
    axiosInstance,
    {
      method: 'post',
      url: `${resourcePath}/list`,
      data: filter,
    },
    true
  );
}

export type CursorAndAsyncIterator<T> = Promise<CursorResponse<T>> &
  CogniteAsyncIterator<T>;

/** @hidden */
export function generateListEndpoint<
  RequestFilter extends object,
  ResponseType
>(
  axiosInstance: AxiosInstance,
  resourcePath: string,
  metadataMap: MetadataMap,
  withPost: boolean = true
) {
  function addNextPageFunction<T>(
    dataWithCursor: CursorResponse<T>,
    params: RequestFilter
  ) {
    const { nextCursor } = dataWithCursor;
    const next = nextCursor
      ? () => list(Object.assign({}, params, { cursor: nextCursor }))
      : undefined;
    Object.assign(dataWithCursor, { next });
  }

  async function list(filter: RequestFilter) {
    const response = await (withPost
      ? listByPost<RequestFilter, ResponseType>(
          axiosInstance,
          resourcePath,
          filter
        )
      : listByGet<RequestFilter, ResponseType>(
          axiosInstance,
          resourcePath,
          filter
        ));
    addNextPageFunction(response.data, filter);
    return metadataMap.addAndReturn(response.data, response);
  }

  return (params: RequestFilter = {} as RequestFilter) => {
    const listPromise = list(params);
    return Object.assign(
      listPromise,
      makeAutoPaginationMethods<ResponseType>(listPromise)
    );
  };
}

/** @hidden */
export function generateListNoCursorEndpoint<ResponseType>(
  axiosInstance: AxiosInstance,
  resourcePath: string,
  metadataMap: MetadataMap
) {
  return async function list(): Promise<ResponseType[]> {
    const response = await rawRequest<ItemsResponse<ResponseType>>(
      axiosInstance,
      {
        method: 'get',
        url: resourcePath,
      },
      true
    );
    return metadataMap.addAndReturn(response.data.items, response);
  };
}

/** @hidden */
export function generateListNoCursorEndpointWithQueryParams<
  RequestParams,
  ResponseType
>(
  axiosInstance: AxiosInstance,
  resourcePath: string,
  metadataMap: MetadataMap
) {
  return async function list(params?: RequestParams): Promise<ResponseType[]> {
    const response = await rawRequest<ItemsResponse<ResponseType>>(
      axiosInstance,
      {
        method: 'get',
        url: resourcePath,
        params,
      },
      true
    );
    return metadataMap.addAndReturn(response.data.items, response);
  };
}

/** @hidden */
export function generateSimpleListEndpoint<RequestParams, ResponseType>(
  axiosInstance: AxiosInstance,
  resourcePath: string,
  metadataMap: MetadataMap
) {
  return async function list(filter: RequestParams): Promise<ResponseType[]> {
    const response = await rawRequest<ItemsResponse<ResponseType>>(
      axiosInstance,
      {
        method: 'post',
        url: `${resourcePath}/list`,
        data: filter,
      },
      true
    );
    return metadataMap.addAndReturn(response.data.items, response);
  };
}

/** @hidden */
export function generateRetrieveEndpoint<IdType, ResponseType>(
  axiosInstance: AxiosInstance,
  resourcePath: string,
  metadataMap: MetadataMap,
  chunkFunction?: (ids: IdType[]) => IdType[][]
) {
  return async function retrieve(ids: IdType[]): Promise<ResponseType[]> {
    const chunks = doChunking<IdType>(ids, chunkFunction);
    const responses = await promiseAllWithData(
      chunks,
      input =>
        rawRequest<ItemsResponse<ResponseType>>(
          axiosInstance,
          {
            method: 'post',
            url: `${resourcePath}/byids`,
            data: { items: input },
          },
          true
        ),
      false
    );
    const mergedResponses = concat(
      [],
      ...responses.map(response => response.data.items)
    );
    return metadataMap.addAndReturn(mergedResponses, responses[0]);
  };
}

/** @hidden */
export function generateRetrieveSingleEndpoint<IdType, ResponseType>(
  axiosInstance: AxiosInstance,
  resourcePath: string,
  metadataMap: MetadataMap
) {
  return async function retrieveSingle(id: IdType): Promise<ResponseType> {
    const response = await rawRequest<ResponseType>(axiosInstance, {
      url: `${resourcePath}/${encodeURIComponent('' + id)}`,
      method: 'get',
    });
    return metadataMap.addAndReturn(response.data, response);
  };
}

/** @hidden */
export function generateDeleteEndpoint<IdType>(
  axiosInstance: AxiosInstance,
  resourcePath: string,
  metadataMap: MetadataMap,
  chunkFunction?: (ids: IdType[]) => IdType[][]
) {
  return async function remove(ids: IdType[]): Promise<{}> {
    const chunks = doChunking<IdType>(ids, chunkFunction);
    const responses = await promiseAllWithData(
      chunks,
      input =>
        rawRequest<ItemsResponse<ResponseType>>(axiosInstance, {
          method: 'post',
          url: `${resourcePath}/delete`,
          data: { items: input },
        }),
      true
    );
    return metadataMap.addAndReturn({}, responses[0]);
  };
}

/** @hidden */
export function generateDeleteEndpointWithParams<IdType, ParamsType>(
  axiosInstance: AxiosInstance,
  resourcePath: string,
  metadataMap: MetadataMap,
  chunkFunction?: (ids: IdType[]) => IdType[][]
) {
  return async function remove(
    ids: IdType[],
    params?: ParamsType
  ): Promise<{}> {
    const chunks = doChunking<IdType>(ids, chunkFunction);
    const responses = await promiseAllWithData(
      chunks,
      input =>
        rawRequest<ItemsResponse<ResponseType>>(axiosInstance, {
          method: 'post',
          url: `${resourcePath}/delete`,
          data: { ...(params || {}), items: input },
        }),
      true
    );
    return metadataMap.addAndReturn({}, responses[0]);
  };
}

/** @hidden */
export function generateUpdateEndpoint<RequestType, ResponseType>(
  axiosInstance: AxiosInstance,
  resourcePath: string,
  metadataMap: MetadataMap,
  chunkFunction?: (changes: RequestType[]) => RequestType[][]
) {
  return async function update(
    changes: RequestType[]
  ): Promise<ResponseType[]> {
    type Response = ItemsResponse<ResponseType>;
    const chunks = doChunking<RequestType>(changes, chunkFunction);
    const responses = await promiseAllWithData(
      chunks,
      input =>
        rawRequest<Response>(axiosInstance, {
          method: 'post',
          url: `${resourcePath}/update`,
          data: { items: input },
        }),
      false
    );
    const mergedResponses = concat(
      [],
      ...responses.map(response => response.data.items)
    );
    return metadataMap.addAndReturn(mergedResponses, responses[0]);
  };
}

/** @hidden */
export function generateSearchEndpoint<RequestParams, ResponseType>(
  axiosInstance: AxiosInstance,
  resourcePath: string,
  metadataMap: MetadataMap
) {
  return async function search(query: RequestParams): Promise<ResponseType[]> {
    const response = await rawRequest<ItemsResponse<ResponseType>>(
      axiosInstance,
      {
        method: 'post',
        url: `${resourcePath}/search`,
        data: query,
      },
      true
    );
    return metadataMap.addAndReturn(response.data.items, response);
  };
}

/** @hidden */
export function generateRetrieveLatestEndpoint<RequestParams, ResponseType>(
  axiosInstance: AxiosInstance,
  resourcePath: string,
  metadataMap: MetadataMap
) {
  return async function retrieveLatest(
    query: RequestParams
  ): Promise<ResponseType[]> {
    const response = await rawRequest<ItemsResponse<ResponseType>>(
      axiosInstance,
      {
        method: 'post',
        url: `${resourcePath}/latest`,
        data: { items: query },
      },
      true
    );
    return metadataMap.addAndReturn(response.data.items, response);
  };
}

/** @hidden */
export function generateInsertEndpoint<RequestParams>(
  axiosInstance: AxiosInstance,
  resourcePath: string,
  metadataMap: MetadataMap,
  chunkFunction?: (items: RequestParams[]) => RequestParams[][]
) {
  return async function insert(items: RequestParams[]): Promise<{}> {
    const chunks = doChunking<RequestParams>(items, chunkFunction);
    const responses = await promiseAllWithData(
      chunks,
      input =>
        rawRequest<ItemsResponse<{}>>(axiosInstance, {
          method: 'post',
          url: resourcePath,
          data: { items: input },
        }),
      true
    );
    return metadataMap.addAndReturn({}, responses[0]);
  };
}

/** @hidden */
export function generateSingleReplaceEndpoint<RequestType, RepsonseType>(
  axiosInstance: AxiosInstance,
  resourcePath: string,
  metadataMap: MetadataMap
) {
  return async function replace(
    replacement: RequestType
  ): Promise<RepsonseType> {
    const response = await rawRequest<RepsonseType>(
      axiosInstance,
      {
        method: 'put',
        url: resourcePath,
        data: replacement,
      },
      true
    );
    return metadataMap.addAndReturn(response.data, response);
  };
}

function doChunking<Type>(
  items: Type[],
  chunkFunction?: (ids: Type[]) => Type[][]
) {
  let chunks: Type[][] = [[]];
  if (items.length) {
    chunks = chunkFunction ? chunkFunction(items) : chunk(items, 1000);
  }
  return chunks;
}
