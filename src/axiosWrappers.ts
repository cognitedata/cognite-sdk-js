// Copyright 2019 Cognite AS

import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
} from 'axios';
import { handleErrorResponse } from './error';
import { CogniteResponse } from './types/types';

/** @hidden */
export function generateAxiosInstance(baseUrl: string): AxiosInstance {
  const instance = axios.create({
    baseURL: baseUrl,
    headers: {},
  });
  return instance;
}

/** @hidden */
export function setBearerToken(axiosInstance: AxiosInstance, token: string) {
  axiosInstance.defaults.headers.Authorization = `Bearer ${token}`;
}

/** @hidden */
export function listenForNonSuccessStatusCode(
  axiosInstance: AxiosInstance,
  status: number,
  handler: (error: AxiosError, retry: () => void) => Promise<void>
) {
  axiosInstance.interceptors.response.use(
    response => response,
    (error: AxiosError) => {
      const response = (error.response as AxiosResponse) || {};
      if (response.status === status) {
        const retry = () => {
          return rawRequest(axiosInstance, error.config);
        };
        return handler(error, retry);
      }
      return Promise.reject(error);
    }
  );
}

/** @hidden */
export async function rawRequest(
  axiosInstance: AxiosInstance,
  requestConfig: AxiosRequestConfig
): Promise<any> {
  return axiosInstance(requestConfig).catch(handleErrorResponse);
}

/** @hidden */
export async function rawGet<T>(
  axiosInstance: AxiosInstance,
  path: string,
  requestConfig: AxiosRequestConfig = {}
): Promise<AxiosResponse<CogniteResponse<T>>> {
  return rawRequest(axiosInstance, {
    method: 'get',
    url: path,
    ...requestConfig,
  });
}

/** @hidden */
export async function rawPost<T>(
  axiosInstance: AxiosInstance,
  path: string,
  requestConfig: AxiosRequestConfig = {}
): Promise<AxiosResponse<CogniteResponse<T>>> {
  return rawRequest(axiosInstance, {
    method: 'post',
    url: path,
    ...requestConfig,
  });
}
