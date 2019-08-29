// Copyright 2019 Cognite AS

import { handleErrorResponse } from '@/error';
import {
  // isJson,
  isJson,
  transformDateInRequest,
  transformDateInResponse,
  // transformDateInResponse,
} from '@/utils';
import * as Url from 'url';
import {
  HttpHeaders,
  HttpQueryParams,
  HttpRequest,
  HttpResponse,
} from './basicHttpClient';
import { cdfRetryValidator } from './cdfRetryValidator';
import { RetryableHttpClient } from './retryableHttpClient';

const AUTHORIZATION = 'Authorization';

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

  private static filterHeader(headers: HttpHeaders, name: string) {
    const filteredHeaders: HttpHeaders = {
      ...headers,
    };
    delete filteredHeaders[name];
    return filteredHeaders;
  }

  constructor(baseUrl: string) {
    super(baseUrl, cdfRetryValidator);
  }

  public setBearerToken(token: string) {
    this.setDefaultHeader(AUTHORIZATION, `Bearer ${token}`);
  }

  protected preRequest(request: HttpRequest): HttpRequest {
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

  protected postRequest<T>(response: HttpResponse<T>): HttpResponse<T> {
    const transformedResponse = CDFHttpClient.transformDateInResponse(response);
    try {
      return super.postRequest(transformedResponse);
    } catch (err) {
      throw handleErrorResponse(err);
    }
  }

  private preventTokenLeakage(headers: HttpHeaders, path: string) {
    if (CDFHttpClient.isSameOrigin(this.baseUrl, path)) {
      return headers;
    }
    return CDFHttpClient.filterHeader(headers, AUTHORIZATION);
  }
}
