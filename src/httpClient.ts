// Copyright 2019 Cognite AS

import axios, { AxiosError, AxiosInstance } from 'axios';
import { CogniteError } from './error';

type HttpMethod = 'get' | 'post' | 'put' | 'delete';

export interface BaseRequestOptions {
  data?: any;
  params?: object;
  headers?: { [key: string]: string };
  responseType?: 'json' | 'arraybuffer' | 'text';
}

export interface Response<T> {
  data: T;
  headers: { [key: string]: string };
  status: number;
}

export class HttpClient {
  private readonly axiosInstance: AxiosInstance;
  constructor(baseUrl: string) {
    this.axiosInstance = axios.create({
      baseURL: baseUrl,
      headers: {},
    });
  }

  public setHeader(name: string, value: string) {
    this.axiosInstance.defaults.headers[name] = value;
    return this;
  }

  public get<ResponseType>(path: string, options: BaseRequestOptions = {}) {
    return this.rawRequest<ResponseType>(path, 'get', options);
  }

  public post<ResponseType>(path: string, options: BaseRequestOptions = {}) {
    return this.rawRequest<ResponseType>(path, 'post', options);
  }

  public delete<ResponseType>(path: string, options: BaseRequestOptions = {}) {
    return this.rawRequest<ResponseType>(path, 'delete', options);
  }

  private async rawRequest<ResponseType>(
    path: string,
    method: HttpMethod,
    requestConfig: BaseRequestOptions
  ): Promise<Response<ResponseType>> {
    try {
      const response = await this.axiosInstance.request<ResponseType>({
        ...requestConfig,
        method,
        url: path,
      });
      return {
        data: response.data,
        headers: response.headers,
        status: response.status,
      };
    } catch (e) {
      throw this.handleErrorResponse(e);
    }
  }

  private handleErrorResponse(err: AxiosError) {
    let statusCode;
    let message;
    let requestId;
    let missing;
    let duplicated;
    try {
      statusCode = err.response!.status;
      message = err.response!.data.error.message;
      missing = err.response!.data.error.missing;
      duplicated = err.response!.data.error.duplicated;
      requestId = (err.response!.headers || {})['X-Request-Id'];
    } catch (_) {
      throw err;
    }
    throw new CogniteError(message, statusCode, requestId, {
      missing,
      duplicated,
    });
  }
}
