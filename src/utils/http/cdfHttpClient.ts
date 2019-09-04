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
  constructor(baseUrl: string) {
    super(baseUrl, cdfRetryValidator);
  }

  public setBearerToken(token: string) {
    this.setDefaultHeader(AUTHORIZATION_HEADER, bearerString(token));
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

  public set401ResponseHandler(handler: Response401Handler) {
    this.response401Handler = handler;
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
      if (err.status === 401 && !this.isLoginEndpoint(request.path)) {
        return new Promise((resolvePromise, rejectPromise) => {
          const retry = () => resolvePromise(this.request(request));
          const reject = () => rejectPromise(err);
          this.response401Handler(err, retry, reject);
        });
      }
      throw handleErrorResponse(err);
    }
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

  private isLoginEndpoint(url: string) {
    return url.toLowerCase().indexOf('/login/status') !== -1;
  }
}

export interface IdInfo {
  project: string;
  user: string;
}

type Response401Handler = (
  err: HttpError,
  retry: () => void,
  reject: () => void
) => void;
