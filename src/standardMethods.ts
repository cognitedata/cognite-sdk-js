// Copyright 2019 Cognite AS

import { AxiosInstance, AxiosResponse } from 'axios';
import { makeAutoPaginationMethods } from './autoPagination';
import { rawGet, rawPost } from './axiosWrappers';
import { MetadataMap } from './metadata';
import { CogniteResponse, CursorResponse, ItemsResponse } from './types/types';

type CreateEndpoint<RequestType, ResponseType> = (
  items: RequestType[]
) => Promise<ResponseType[]>;

export function generateCreateEndpoint<RequestType, ResponseType>(
  axiosInstance: AxiosInstance,
  resourcePath: string,
  metadataMap: MetadataMap
): CreateEndpoint<RequestType, ResponseType> {
  return async function create(items) {
    const body = { items };
    const response = (await rawPost(axiosInstance, resourcePath, {
      data: body,
    })) as AxiosResponse<CogniteResponse<ItemsResponse<ResponseType>>>;
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
    const response = await rawGet<CursorResponse<ResponseType>>(
      axiosInstance,
      resourcePath,
      {
        params,
      }
    );
    addNextPageFunction(response.data.data, params);
    return metadataMap.addAndReturn(response.data.data, response);
  }

  return (params: RequestParams = {} as RequestParams) => {
    const listPromise = list(params);
    const autoPaginationMethods = makeAutoPaginationMethods(listPromise);
    return Object.assign(listPromise, autoPaginationMethods);
  };
}

export function generateRetrieveEndpoint<ResponseType>(
  axiosInstance: AxiosInstance,
  resourcePath: string,
  metadataMap: MetadataMap
) {
  return async function retrieve(id: number): Promise<ResponseType> {
    const path = `${resourcePath}/${id}`;
    const response = await rawGet<ItemsResponse<ResponseType>>(
      axiosInstance,
      path
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
    const path = `${resourcePath}/byids`;
    const body = { items: ids };
    const response = (await rawPost(axiosInstance, path, {
      data: body,
    })) as AxiosResponse<CogniteResponse<ItemsResponse<ResponseType>>>;
    return metadataMap.addAndReturn(response.data.data.items, response);
  };
}

export function generateDeleteEndpoint(
  axiosInstance: AxiosInstance,
  resourcePath: string,
  metadataMap: MetadataMap
) {
  return async function remove(ids: number[]): Promise<{}> {
    const path = `${resourcePath}/delete`;
    const body = { items: ids };
    const response = (await rawPost(axiosInstance, path, {
      data: body,
    })) as AxiosResponse<{}>;
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
    const path = `${resourcePath}/update`;
    const body = { items: changes };
    const response = (await rawPost(axiosInstance, path, {
      data: body,
    })) as AxiosResponse<CogniteResponse<ItemsResponse<ResponseType>>>;
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
    const path = `${resourcePath}/search`;
    const response = (await rawGet(axiosInstance, path, {
      params,
    })) as AxiosResponse<CogniteResponse<ItemsResponse<ResponseType>>>;
    return metadataMap.addAndReturn(response.data.data.items, response);
  };
}
