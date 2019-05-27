// Copyright 2019 Cognite AS

import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
} from 'axios';
import { version } from '../package.json';
import { handleErrorResponse } from './error';
import { makeRequestSafeToRetry } from './retryRequests';
import { transformDateInRequest, transformDateInResponse } from './utils';

/** @hidden */
export function generateAxiosInstance(
  baseUrl: string,
  appId?: string
): AxiosInstance {
  const headers: { [key: string]: string } = {
    'x-cdp-sdk': `CogniteJavaScriptSDK:${version}`,
  };
  if (appId) {
    headers['x-cdp-app'] = appId;
  }
  return axios.create({
    baseURL: baseUrl,
    headers,
  });
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
export async function rawRequest<ResponseType>(
  axiosInstance: AxiosInstance,
  requestConfig: AxiosRequestConfig,
  isSafeToRetry: boolean = false
) {
  if (isSafeToRetry) {
    makeRequestSafeToRetry(requestConfig);
  }
  requestConfig.data = transformDateInRequest(requestConfig.data);
  requestConfig.params = transformDateInRequest(requestConfig.params || {});
  try {
    const response = (await axiosInstance(requestConfig)) as AxiosResponse<
      ResponseType
    >;
    response.data = transformDateInResponse(response.data);
    return response;
  } catch (e) {
    throw handleErrorResponse(e);
  }
}
