// Copyright 2019 Cognite AS

import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
} from 'axios';
import * as Url from 'url';
import { version } from '../package.json';
import { handleErrorResponse } from './error';
import { makeRequestSafeToRetry } from './retryRequests';
import { transformDateInRequest, transformDateInResponse } from './utils';

/** @hidden */
export function generateAxiosInstance(baseUrl: string, appId?: string) {
  const headers: { [key: string]: string } = {
    'x-cdp-sdk': `CogniteJavaScriptSDK:${version}`,
  };
  if (appId) {
    headers['x-cdp-app'] = appId;
  }
  return addArraySerializer(
    addTokenLeakageProtection(
      axios.create({
        baseURL: baseUrl,
        headers,
      })
    )
  );
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

function isSameOrigin(baseUrl: string, newUrl: string) {
  const baseUrlParsed = Url.parse(baseUrl);
  const newUrlParsed = Url.parse(Url.resolve(baseUrl, newUrl));
  // check that protocol and hostname are the same
  return (
    baseUrlParsed.protocol === newUrlParsed.protocol &&
    baseUrlParsed.host === newUrlParsed.host
  );
}

function addTokenLeakageProtection(
  axiosInstance: AxiosInstance
): AxiosInstance {
  axiosInstance.interceptors.request.use((config: AxiosRequestConfig) => {
    const isUnknownDomain = !isSameOrigin(
      config.baseURL || '',
      config.url || ''
    );
    if (isUnknownDomain) {
      const newHeaders = { ...config.headers };
      delete newHeaders.Authorization;
      config.headers = newHeaders;
    }
    return config;
  });

  return axiosInstance;
}

function addArraySerializer(axiosInstance: AxiosInstance): AxiosInstance {
  axiosInstance.interceptors.request.use(
    (config: AxiosRequestConfig): AxiosRequestConfig => {
      // loop through params
      Object.keys(config.params || {}).forEach(key => {
        const param = config.params[key];
        if (Array.isArray(param)) {
          config.params[key] = JSON.stringify(param);
        }
      });
      return config;
    }
  );
  return axiosInstance;
}
