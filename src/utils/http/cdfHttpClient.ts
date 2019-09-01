// Copyright 2019 Cognite AS

import {
  API_KEY_HEADER,
  AUTHORIZATION_HEADER,
  X_CDF_APP_HEADER,
  X_CDF_SDK_HEADER,
} from '@/constants';
import { handleErrorResponse } from '@/error';
import {
  bearerString,
  isJson,
  transformDateInRequest,
  transformDateInResponse,
} from '@/utils';
import * as Url from 'url';
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
    return Object.keys(params).reduce(
      (serializedParams, key) => {
        const param = params[key];
        if (Array.isArray(param)) {
          serializedParams[key] = JSON.stringify(param);
        } else {
          serializedParams[key] = param;
        }
        return serializedParams;
      },
      {} as HttpQueryParams
    );
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
    const filteredHeaders = names.reduce(
      (partiallyFilteredHeaders, headerName) => {
        return CDFHttpClient.filterHeader(partiallyFilteredHeaders, headerName);
      },
      headers
    );
    return filteredHeaders;
  }

  private static filterHeader(headers: HttpHeaders, name: string) {
    const filteredHeaders: HttpHeaders = {
      ...headers,
    };
    delete filteredHeaders[name];
    return filteredHeaders;
  }

  // @ts-ignore
  private notAuthenticatedHandler: NotAuthenticatedHandler;
  constructor(baseUrl: string) {
    super(baseUrl, cdfRetryValidator);
    this.notAuthenticatedHandler = (_, __, ignore) => ignore();
  }

  public setBearerToken(token: string) {
    this.setDefaultHeader(AUTHORIZATION_HEADER, bearerString(token));
  }

  public setNotAuthenticatedHandler(handler: NotAuthenticatedHandler) {
    this.notAuthenticatedHandler = handler;
  }

  public async getIdInfo(headers: HttpHeaders): Promise<null | IdInfo> {
    try {
      const response = await this.get<any>('/login/status', { headers });
      const { loggedIn, user, project } = response.data.data;
      if (!loggedIn) {
        return null;
      }
      return {
        user,
        project,
      };
    } catch (err) {
      if (err.status === 401) {
        return null;
      }
      throw err;
    }
  }

  protected async preRequest(request: HttpRequest): Promise<HttpRequest> {
    const headersWithDefaultHeaders = this.populateDefaultHeaders(
      request.headers
    );
    const headers = this.preventTokenLeakage(
      headersWithDefaultHeaders,
      request.path
    );
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

  protected async postRequest<T>(
    response: HttpResponse<T>,
    request: HttpRequest
  ): Promise<HttpResponse<T>> {
    const transformedResponse = CDFHttpClient.transformDateInResponse(response);
    try {
      return await super.postRequest(transformedResponse, request);
    } catch (err) {
      throw handleErrorResponse(err);
    }
  }

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
}

export interface IdInfo {
  project: string;
  user: string;
}

type NotAuthenticatedHandler = (
  err: HttpError,
  retry: () => void,
  ignore: () => void
) => void;
