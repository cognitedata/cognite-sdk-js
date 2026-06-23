// Copyright 2020 Cognite AS

import fetch, { Response } from 'cross-fetch';
import { DEFAULT_DOMAIN } from '../constants';
import { isJson } from '../utils';
import { HttpError, type HttpErrorData } from './httpError';
import type { HttpHeaders } from './httpHeaders';
import { mapKeys } from 'lodash';

/**
 * The `BasicHttpClient` class provides a simplified HTTP client for making
 * requests to a server. It abstracts away the underlying HTTP client and
 * the complexities of handling different response types and error handling,
 * making it easier to interact with HTTP APIs.
 *
 * This class includes static methods for:
 * - Validating HTTP status codes.
 * - Throwing custom error responses.
 * - Handling JSON, text, and array buffer responses.
 * - Selecting the appropriate response handler based on the expected response type.
 *
 * The `BasicHttpClient` is designed to be used in scenarios where you need to
 * make HTTP requests and handle responses in a consistent and predictable manner.
 * It ensures that responses are correctly parsed and that errors are properly
 * propagated, allowing for robust error handling.
 *
 * @remarks
 * This class relies on the `cross-fetch` library for making HTTP requests,
 * and it uses custom error and header types defined in the project.
 *
 * @see {@link HttpError}
 * @see {@link HttpHeaders}
 * @see {@link HttpResponseType}
 */
export class BasicHttpClient {
  private static validateStatusCode(status: number) {
    return status >= 200 && status < 300;
  }
  private static throwCustomErrorResponse<T>(response: HttpResponse<T>) {
    throw new HttpError(
      response.status,
      response.data as HttpErrorData,
      response.headers
    );
  }

  private static jsonResponseHandler<ResponseType>(
    res: Response
  ): Promise<ResponseType> {
    return res.json() as Promise<ResponseType>;
  }

  private static textResponseHandler<ResponseType>(
    res: Response
  ): Promise<ResponseType> {
    return res.text() as unknown as Promise<ResponseType>;
  }

  private static arrayBufferResponseHandler<ResponseType>(
    res: Response
  ): Promise<ResponseType> {
    return res
      .blob()
      .then((blob) =>
        new Response(blob).arrayBuffer()
      ) as unknown as Promise<ResponseType>;
  }

  private static getResponseHandler<ResponseType>(
    responseType?: HttpResponseType
  ): ResponseHandler<ResponseType> {
    switch (responseType) {
      case HttpResponseType.ArrayBuffer:
        return BasicHttpClient.arrayBufferResponseHandler;
      case HttpResponseType.Text:
        return BasicHttpClient.textResponseHandler;
      default:
        return BasicHttpClient.jsonResponseHandler;
    }
  }

  private static convertFetchHeaders(fetchHeaders: Headers) {
    const headers: HttpHeaders = {};
    fetchHeaders.forEach((value, key) => {
      headers[key] = value;
    });
    return headers;
  }

  private static transformRequestBody(data: unknown) {
    const isJSONStringifyable = isJson(data);
    if (isJSONStringifyable) {
      return JSON.stringify(data, null, 2);
    }
    return data;
  }

  private static resolveUrl(baseUrl: string, path: string) {
    const trimmedBaseUrl = baseUrl.replace(/\/$/, '');
    const pathWithPrefix = (path[0] === '/' ? '' : '/') + path;
    return trimmedBaseUrl + pathWithPrefix.replace(/\/+$/, '');
  }

  private defaultHeaders: HttpHeaders = {};

  /**
   * A basic http client with the option of adding default headers,
   * and the option of using a baseUrl.
   * Note: If the path given starts with `https://`, the baseUrl is ignored.
   *
   * It handles query parameters, and request body data which gets encoded as json if
   * needed.
   *
   * See HttpRequest.
   *
   * @param baseUrl
   */
  constructor(protected baseUrl: string) { }

  public setDefaultHeader(name: string, value: string) {
    this.defaultHeaders[name] = value;
    return this;
  }

  public getDefaultHeaders(): HttpHeaders {
    return { ...this.defaultHeaders };
  }

  public setBaseUrl(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  public getBaseUrl() {
    return this.baseUrl;
  }

  public setCluster = (cluster: string) => {
    this.baseUrl = `https://${cluster}.${DEFAULT_DOMAIN}`;
  };

  public get<ResponseType>(path: string, options: HttpRequestOptions = {}) {
    return this.request<ResponseType>({
      ...options,
      path,
      method: HttpMethod.Get,
    });
  }

  // TODO: responseType -> factory pattern
  public post<ResponseType>(path: string, options: HttpRequestOptions = {}) {
    return this.request<ResponseType>({
      ...options,
      path,
      method: HttpMethod.Post,
    });
  }

  public put<ResponseType>(path: string, options: HttpRequestOptions = {}) {
    return this.request<ResponseType>({
      ...options,
      path,
      method: HttpMethod.Put,
    });
  }

  public delete<ResponseType>(path: string, options: HttpRequestOptions = {}) {
    return this.request<ResponseType>({
      ...options,
      path,
      method: HttpMethod.Delete,
    });
  }

  public patch<ResponseType>(path: string, options: HttpRequestOptions = {}) {
    return this.request<ResponseType>({
      ...options,
      path,
      method: HttpMethod.Patch,
    });
  }

  protected async preRequest(request: HttpRequest): Promise<HttpRequest> {
    const populatedHeaders = this.populateDefaultHeaders(request.headers);
    return {
      ...request,
      headers: populatedHeaders,
    };
  }

  protected async postRequest<T>(
    response: HttpResponse<T>,
    _: HttpRequest,
    __: HttpRequest
  ): Promise<HttpResponse<T>> {
    const requestIsOk = BasicHttpClient.validateStatusCode(response.status);
    if (!requestIsOk) {
      BasicHttpClient.throwCustomErrorResponse(response);
    }
    return response;
  }

  protected populateDefaultHeaders(headers: HttpHeaders = {}) {
    const mapFn = (_: unknown, key: string) => {
      const lcKey = key.toLowerCase();
      return lcKey === 'authorization' ? 'Authorization' : lcKey;
    };
    return {
      ...mapKeys(this.defaultHeaders, mapFn),
      ...mapKeys(headers, mapFn),
    };
  }

  protected async rawRequest<ResponseType>(
    request: HttpRequest
  ): Promise<HttpResponse<ResponseType>> {
    const url = this.constructUrl(request.path, request.params);
    const headers = headersWithDefaultField(
      request.headers || {},
      'Accept',
      'application/json'
    );
    let body = request.data;
    if (isJson(body)) {
      body = BasicHttpClient.transformRequestBody(body);
      headers['Content-Type'] = 'application/json';
    }
    const res = await fetch(url, {
      // @ts-ignore
      body,
      method: request.method,
      headers,
    });
    const responseHandler = BasicHttpClient.getResponseHandler<ResponseType>(
      request.responseType
    );
    // Cloning to fallback on text response if response is failing the responsehandler.
    // node-fetch < 3.0 will hang on clone() for large responses, that is why the parallel promises https://github.com/node-fetch/node-fetch#custom-highwatermark
    const resClone = res.clone();
    const [data, textFallback] = await Promise.all([
      responseHandler(res).catch(() => undefined),
      resClone.text() as unknown as Promise<ResponseType>,
    ]);
    return {
      headers: BasicHttpClient.convertFetchHeaders(res.headers),
      status: res.status,
      data: data || textFallback,
    };
  }

  protected async request<ResponseType>(request: HttpRequest) {
    const mutatedRequest = await this.preRequest(request);
    const rawResponse = await this.rawRequest<ResponseType>(mutatedRequest);
    return this.postRequest(rawResponse, request, mutatedRequest);
  }

  private constructUrl<T extends object>(path: string, params?: T) {
    let url = path;
    const hasQueryParams = !!params && Object.keys(params).length > 0;
    if (hasQueryParams) {
      const normalizedParams: Record<string, string> = Object.entries(
        params
      ).reduce(
        (acc, [key, value]) => {
          switch (typeof value) {
            case 'undefined': {
              return acc;
            }
            case 'string':
            case 'number':
            case 'boolean': {
              acc[key] = `${value}`;
              return acc;
            }
            case 'object': {
              if (Array.isArray(value)) {
                acc[key] = `[${value.join(',')}]`;
              }
              return acc;
            }
            default: {
              throw new Error(
                `Unsupported value query parameter type: ${typeof value}, ${key}: ${value}`
              );
            }
          }
        },
        {} as Record<string, string>
      );
      const search = new URLSearchParams(normalizedParams).toString();
      url += `?${search}`;
    }
    const urlContainsHost = url.match(/^https?:\/\//i) !== null;
    if (urlContainsHost) {
      return url;
    }
    return BasicHttpClient.resolveUrl(this.baseUrl, url);
  }
}

function lowercaseHeadersKeys(headers: HttpHeaders): string[] {
  const keys: string[] = [];
  for (const key in headers) {
    keys.push(key.toLowerCase());
  }
  return keys;
}

export function headersWithDefaultField(
  headers: HttpHeaders,
  fieldName: string,
  fieldValue: string
): HttpHeaders {
  const lowercaseHeaders = lowercaseHeadersKeys(headers);
  const lowercaseKey = fieldName.toLowerCase();
  if (!lowercaseHeaders.includes(lowercaseKey)) {
    headers[fieldName] = fieldValue;
  }
  return headers;
}

export interface HttpRequest extends HttpRequestOptions {
  path: string;
  method: HttpMethod;
}

export interface HttpRequestOptions {
  data?: unknown | null | undefined;
  params?: HttpQueryParams;
  headers?: HttpHeaders;
  responseType?: HttpResponseType;
  /**
   * Set this to 'true' if you want to send credentials (access token) with the request to other domains than the specified base url.
   */
  withCredentials?: boolean;
}

export interface HttpResponse<T> {
  data: T;
  status: number;
  headers: HttpHeaders;
}

export enum HttpMethod {
  Get = 'GET',
  Post = 'POST',
  Put = 'PUT',
  Delete = 'DELETE',
  Patch = 'PATCH',
}

type HttpResponseType = 'json' | 'arraybuffer' | 'text';

export const HttpResponseType = {
  Json: 'json' as HttpResponseType,
  ArrayBuffer: 'arraybuffer' as HttpResponseType,
  Text: 'text' as HttpResponseType,
};

export type HttpQueryParams = object;

type ResponseHandler<ResponseType> = (res: Response) => Promise<ResponseType>;

export type HttpCall = <ResponseType>(
  path: string,
  options?: HttpRequestOptions
) => Promise<HttpResponse<ResponseType>>;
