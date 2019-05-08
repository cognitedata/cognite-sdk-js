// Copyright 2018 Cognite AS

import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { attach } from 'retry-axios';
import * as url from 'url';
import { MetadataMap } from './MetadataMap';

/** @hidden */
export const BASE_URL: string = 'https://api.cognitedata.com';

export class CogniteSDKError extends Error {
  public status: number;
  public requestId?: string;
  constructor(errorMessage: string, status: number, requestId?: string) {
    let message = `${errorMessage} | code: ${status}`;
    if (requestId) {
      message += ` | X-Request-ID: ${requestId}`;
    }
    super(message);
    this.status = status;
    this.requestId = requestId;
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    } else {
      this.stack = new Error(message).stack;
    }
  }
}

export interface SDKOptions {
  project: string | null;
  apiKey: string | null;
  baseUrl: string;
  withCredentials: boolean;
  timeout: number;
}

const initialOptions: SDKOptions = {
  project: null,
  apiKey: null,
  baseUrl: BASE_URL,
  withCredentials: false,
  timeout: 60 * 1000, // 1 minute timeout by default
};

const options: SDKOptions = { ...initialOptions };

/** @hidden */
export const isBrowser =
  typeof window !== 'undefined' && typeof window.document !== 'undefined';

/** @hidden */
export const apiUrl = (version: number): string => `api/${version}`;
/** @hidden */
export const projectUrl = (project?: string): string =>
  `projects/${encodeURIComponent(project || (options.project as string))}`;

/** @hidden */
export const instance = axios.create({
  baseURL: BASE_URL,
  headers: {},
});

const httpMethodsToRetry = ['GET', 'HEAD', 'OPTIONS', 'DELETE', 'PUT'];
const statusCodesToRetry = [[100, 199], [429, 429], [500, 599]];

// config for retry-axios package
(instance.defaults as any).raxConfig = {
  instance,
  retryDelay: 50,
  retry: 3,
  shouldRetry: (err: any) => {
    const { config, response } = err;

    const httpMethod = config.method.toUpperCase();
    if (httpMethodsToRetry.indexOf(httpMethod) === -1) {
      return false;
    }

    if (response == null) {
      return true;
    }

    const responseStatusCode = response.status;
    let isCodeInValidRange = false;
    statusCodesToRetry.forEach(([start, end]: any) => {
      if (responseStatusCode >= start && responseStatusCode <= end) {
        isCodeInValidRange = true;
      }
    });
    if (!isCodeInValidRange) {
      return false;
    }

    const { currentRetryAttempt, retry } = config.raxConfig;
    return currentRetryAttempt < retry;
  },
};
attach(instance);

instance.interceptors.request.use(
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

function isSameOrigin(baseUrl: string, newUrl: string) {
  const baseUrlParsed = url.parse(baseUrl);
  const newUrlParsed = url.parse(url.resolve(baseUrl, newUrl));
  // check that protocol and hostname are the same
  return (
    baseUrlParsed.protocol === newUrlParsed.protocol &&
    baseUrlParsed.host === newUrlParsed.host
  );
}

instance.interceptors.request.use((config: AxiosRequestConfig) => {
  const isUnknownDomain = !isSameOrigin(config.baseURL || '', config.url || '');
  if (isUnknownDomain) {
    const newHeaders = { ...config.headers };
    delete newHeaders.Authorization;
    config.headers = newHeaders;
  }
  return config;
});

export function configure(opts: Partial<SDKOptions>): SDKOptions {
  Object.assign(options, opts);
  instance.defaults.baseURL = options.baseUrl;
  if (options.apiKey) {
    instance.defaults.headers['api-key'] = options.apiKey;
  }
  if (options.timeout) {
    instance.defaults.timeout = options.timeout;
  }
  return options;
}

export function setBearerToken(token: string) {
  instance.defaults.headers.Authorization = `Bearer ${token}`;
}

function handleCogniteErrorResponse(err: AxiosError) {
  let message;
  let code;
  let requestId;
  try {
    message = err.response!.data.error.message;
    code = err.response!.data.error.code;
    requestId = (err.response!.headers || {})['X-Request-Id'];
  } catch (_) {
    throw err;
  }
  throw new CogniteSDKError(message, code, requestId);
}

type HttpVerb = 'get' | 'post' | 'put' | 'delete';
async function rawRequest(
  verb: HttpVerb,
  url: string,
  reqOpt: AxiosRequestConfig = {}
) {
  return instance({
    url,
    method: verb,
    withCredentials: options.withCredentials,
    ...reqOpt,
  }).catch(handleCogniteErrorResponse);
}

export function rawGet(url: string, reqOpt: AxiosRequestConfig = {}) {
  return rawRequest('get', url, reqOpt);
}

export function rawPost(url: string, reqOpt: AxiosRequestConfig = {}) {
  return rawRequest('post', url, reqOpt);
}

export function rawPut(url: string, reqOpt: AxiosRequestConfig = {}) {
  return rawRequest('put', url, reqOpt);
}

export function rawDelete(url: string, reqOpt: AxiosRequestConfig = {}) {
  return rawRequest('delete', url, reqOpt);
}

/** @hidden */
export const metadataMap = new MetadataMap();

export function getMetadata(response: any) {
  return metadataMap.get(response);
}
