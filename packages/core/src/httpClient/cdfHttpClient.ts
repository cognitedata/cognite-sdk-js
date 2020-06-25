// Copyright 2020 Cognite AS

import * as Url from 'url';
import {
  API_KEY_HEADER,
  AUTHORIZATION_HEADER,
  X_CDF_APP_HEADER,
  X_CDF_SDK_HEADER,
} from '../constants';
import { handleErrorResponse } from '../error';
import {
  bearerString,
  isJson,
  transformDateInRequest,
  transformDateInResponse,
} from '../utils';
import {
  HttpHeaders,
  HttpQueryParams,
  HttpRequest,
  HttpResponse,
} from './basicHttpClient';
import { cdfRetryValidator } from './cdfRetryValidator';
import { HttpError } from './httpError';
import { RetryableHttpClient } from './retryableHttpClient';

export class CDFHttpClient extends RetryableHttpClient {
  private static serializeQueryParameters(
    params: HttpQueryParams = {}
  ): HttpQueryParams {
    return Object.keys(params).reduce((serializedParams, key) => {
      const param = params[key];
      serializedParams[key] = isJson(param) ? JSON.stringify(param) : param;
      return serializedParams;
    }, {} as HttpQueryParams);
  }

  private static transformDateInResponse<T>(
    response: HttpResponse<T>
  ): HttpResponse<T> {
    const { data } = response;
    if (!isJson(data)) {
      return response;
    }
    return {
      ...response,
      data: transformDateInResponse(data),
    };
  }

  private static isSameOrigin(baseUrl: string, url: string) {
    const { protocol: baseUrlProtocol, host: baseUrlHost } = Url.parse(baseUrl);
    const { protocol, host } = Url.parse(Url.resolve(baseUrl, url));
    const hasSameProtocol = baseUrlProtocol === protocol;
    const hasSameHost = baseUrlHost === host;
    return hasSameProtocol && hasSameHost;
  }

  private static filterHeaders(headers: HttpHeaders, names: string[]) {
    return names.reduce(
      (partiallyFilteredHeaders, headerName) =>
        CDFHttpClient.filterHeader(partiallyFilteredHeaders, headerName),
      headers
    );
  }

  private static filterHeader(headers: HttpHeaders, name: string) {
    const filteredHeaders: HttpHeaders = {
      ...headers,
    };
    delete filteredHeaders[name];
    return filteredHeaders;
  }

  private oneTimeHeaders: HttpHeaders = {};

  constructor(baseUrl: string) {
    super(baseUrl, cdfRetryValidator);
  }

  public addOneTimeHeader(name: string, value: string) {
    this.oneTimeHeaders[name] = value;
    return this;
  }

  public setBearerToken(token: string) {
    this.setDefaultHeader(AUTHORIZATION_HEADER, bearerString(token));
  }

  public set401ResponseHandler(handler: Response401Handler) {
    this.response401Handler = handler;
  }

  protected async preRequest(request: HttpRequest): Promise<HttpRequest> {
    const headersWithDefaultHeaders = this.populateDefaultHeaders(
      request.headers
    );
    const headers = request.withCredentials
      ? headersWithDefaultHeaders
      : this.preventTokenLeakage(headersWithDefaultHeaders, request.path);
    const data = transformDateInRequest(request.data);
    const serializedQueryParams = CDFHttpClient.serializeQueryParameters(
      request.params
    );
    const params = transformDateInRequest(serializedQueryParams);
    return {
      ...request,
      data,
      headers,
      params,
    };
  }

  protected async request<ResponseType>(request: HttpRequest) {
    request.headers = this.enrichWithOneTimeHeaders(request.headers);
    return super.request<ResponseType>(request);
  }

  protected async postRequest<T>(
    response: HttpResponse<T>,
    request: HttpRequest
  ): Promise<HttpResponse<T>> {
    const transformedResponse = CDFHttpClient.transformDateInResponse(response);
    try {
      return await super.postRequest(transformedResponse, request);
    } catch (err) {
      if (err.status === 401 && !this.isLoginOrLogoutApi(request.path)) {
        return new Promise((resolvePromise, rejectPromise) => {
          const retry = () => resolvePromise(this.request(request));
          const reject = () => rejectPromise(err);
          this.response401Handler(err, retry, reject);
        });
      }
      throw handleErrorResponse(err);
    }
  }

  private enrichWithOneTimeHeaders(headers?: HttpHeaders) {
    const disposableHeaders = this.oneTimeHeaders;
    this.oneTimeHeaders = {};
    return {
      ...headers,
      ...disposableHeaders,
    };
  }

  private response401Handler: Response401Handler = (_, __, reject) => reject();

  private preventTokenLeakage(headers: HttpHeaders, path: string) {
    if (CDFHttpClient.isSameOrigin(this.baseUrl, path)) {
      return headers;
    }
    return CDFHttpClient.filterHeaders(headers, [
      AUTHORIZATION_HEADER,
      API_KEY_HEADER,
      X_CDF_APP_HEADER,
      X_CDF_SDK_HEADER,
    ]);
  }

  private isLoginOrLogoutApi(url: string) {
    const lowerCaseUrl = url.toLowerCase();
    return (
      lowerCaseUrl.indexOf('/logout/url') !== -1 ||
      lowerCaseUrl.indexOf('/login/status') !== -1
    );
  }
}

type Response401Handler = (
  err: HttpError,
  retry: () => void,
  reject: () => void
) => void;
