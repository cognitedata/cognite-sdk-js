// Copyright 2019 Cognite AS

import { AxiosInstance } from 'axios';
import { makeAutoPaginationMethods } from './autoPagination';
import { rawRequest } from './axiosWrappers';
import { MetadataMap } from './metadata';
import { CursorResponse, ItemsResponse } from './types/types';

type CreateEndpoint<RequestType, ResponseType> = (
  items: RequestType[]
) => Promise<ResponseType[]>;

export function generateCreateEndpoint<RequestType, ResponseType>(
  axiosInstance: AxiosInstance,
  resourcePath: string,
  metadataMap: MetadataMap
): CreateEndpoint<RequestType, ResponseType> {
  return async function create(items) {
    type Response = ItemsResponse<ResponseType>;
    const response = await rawRequest<Response>(axiosInstance, {
      method: 'post',
      url: resourcePath,
      data: { items },
    });
    return metadataMap.addAndReturn(response.data.data.items, response);
  };
}

export function generateListEndpoint<
  RequestParams extends object,
  ResponseType
>(
  axiosInstance: AxiosInstance,
  resourcePath: string,
  metadataMap: MetadataMap
) {
  function addNextPageFunction<T>(
    dataWithCursor: CursorResponse<T>,
    params: RequestParams
  ) {
    const { nextCursor } = dataWithCursor;
    const next = nextCursor
      ? () => list(Object.assign({}, params, { cursor: nextCursor }))
      : undefined;
    Object.assign(dataWithCursor, { next });
  }

  async function list(params: RequestParams) {
    const response = await rawRequest<CursorResponse<ResponseType>>(
      axiosInstance,
      {
        method: 'get',
        url: resourcePath,
        params,
      }
    );
    addNextPageFunction(response.data.data, params);
    return metadataMap.addAndReturn(response.data.data, response);
  }

  return (params: RequestParams = {} as RequestParams) => {
    const listPromise = list(params);
    return makeAutoPaginationMethods(listPromise);
  };
}

export function generateRetrieveEndpoint<ResponseType>(
  axiosInstance: AxiosInstance,
  resourcePath: string,
  metadataMap: MetadataMap
) {
  return async function retrieve(id: number): Promise<ResponseType> {
    const response = await rawRequest<ItemsResponse<ResponseType>>(
      axiosInstance,
      {
        method: 'get',
        url: `${resourcePath}/${id}`,
      }
    );
    return metadataMap.addAndReturn(response.data.data.items[0], response);
  };
}

export function generateRetrieveMultipleEndpoint<ResponseType>(
  axiosInstance: AxiosInstance,
  resourcePath: string,
  metadataMap: MetadataMap
) {
  return async function retrieveMultiple(
    ids: number[]
  ): Promise<ResponseType[]> {
    const response = await rawRequest<ItemsResponse<ResponseType>>(
      axiosInstance,
      {
        url: `${resourcePath}/byids`,
        method: 'post',
        data: { items: ids },
      }
    );
    return metadataMap.addAndReturn(response.data.data.items, response);
  };
}

export function generateDeleteEndpoint(
  axiosInstance: AxiosInstance,
  resourcePath: string,
  metadataMap: MetadataMap
) {
  return async function remove(ids: number[]): Promise<{}> {
    const response = await rawRequest<{}>(axiosInstance, {
      url: `${resourcePath}/delete`,
      method: 'post',
      data: { items: ids },
    });
    return metadataMap.addAndReturn({}, response);
  };
}

export function generateUpdateEndpoint<RequestType, ResponseType>(
  axiosInstance: AxiosInstance,
  resourcePath: string,
  metadataMap: MetadataMap
) {
  return async function update(
    changes: RequestType[]
  ): Promise<ResponseType[]> {
    type Response = ItemsResponse<ResponseType>;
    const response = await rawRequest<Response>(axiosInstance, {
      url: `${resourcePath}/update`,
      method: 'post',
      data: { items: changes },
    });
    return metadataMap.addAndReturn(response.data.data.items, response);
  };
}

export function generateSearchEndpoint<RequestParams, ResponseType>(
  axiosInstance: AxiosInstance,
  resourcePath: string,
  metadataMap: MetadataMap
) {
  return async function search(
    params?: RequestParams
  ): Promise<ResponseType[]> {
    const response = await rawRequest<ItemsResponse<ResponseType>>(
      axiosInstance,
      {
        method: 'get',
        url: `${resourcePath}/search`,
        params,
      }
    );
    return metadataMap.addAndReturn(response.data.data.items, response);
  };
}
