// Copyright 2018 Cognite AS

import axios, { AxiosError, AxiosRequestConfig } from 'axios';

/** @hidden */
export const BASE_URL: string = 'https://api.cognitedata.com';

export class CogniteSDKError extends Error {
  public status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    } else {
      this.stack = new Error(message).stack;
    }
  }
}

export interface Options {
  project: string | null;
  apiKey: string | null;
  baseUrl: string;
  withCredentials: boolean;
}

const initialOptions: Options = {
  project: null,
  apiKey: null,
  baseUrl: BASE_URL,
  withCredentials: false,
};

const options: Options = { ...initialOptions };

/** @hidden */
export const apiUrl = (version: number): string => `api/${version}`;
/** @hidden */
export const projectUrl = (project?: string): string =>
  `projects/${encodeURIComponent(project || (options.project as string))}`;

/** @hidden */
export const instance = axios.create({
  baseURL: BASE_URL,
});

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

export function configure(opts: Partial<Options>): Options {
  Object.assign(options, opts);
  instance.defaults.baseURL = options.baseUrl;
  if (options.apiKey) {
    instance.defaults.headers['api-key'] = options.apiKey;
  }
  return options;
}

export function setBearerToken(token: string) {
  instance.defaults.headers.Authorization = `Bearer ${token}`;
}

function handleCogniteErrorResponse(err: AxiosError) {
  let message;
  let code;
  try {
    message = err.response!.data.error.message;
    code = err.response!.data.error.code;
  } catch (_) {
    throw err;
  }
  throw new CogniteSDKError(message, code);
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
