// Copyright 2020 Cognite AS
import { sleepPromise } from '../utils';
import {
  BasicHttpClient,
  HttpRequest,
  HttpRequestOptions,
  HttpResponse,
} from './basicHttpClient';
import { RetryValidator } from './retryValidator';

export class RetryableHttpClient extends BasicHttpClient {
  private static calculateRetryDelayInMs(retryCount: number) {
    const INITIAL_RETRY_DELAY_IN_MS = 250;
    return (
      INITIAL_RETRY_DELAY_IN_MS + ((Math.pow(2, retryCount) - 1) / 2) * 1000
    );
  }

  constructor(baseUrl: string, private retryValidator: RetryValidator) {
    super(baseUrl);
  }

  public get<ResponseType>(
    path: string,
    options: RetryableHttpRequestOptions = {}
  ) {
    return super.get<ResponseType>(path, options);
  }

  public post<ResponseType>(
    path: string,
    options: RetryableHttpRequestOptions = {}
  ) {
    return super.post<ResponseType>(path, options);
  }

  public put<ResponseType>(
    path: string,
    options: RetryableHttpRequestOptions = {}
  ) {
    return super.put<ResponseType>(path, options);
  }

  public delete<ResponseType>(
    path: string,
    options: RetryableHttpRequestOptions = {}
  ) {
    return super.delete<ResponseType>(path, options);
  }

  public patch<ResponseType>(
    path: string,
    options: RetryableHttpRequestOptions = {}
  ) {
    return super.patch<ResponseType>(path, options);
  }

  protected async preRequest(
    request: RetryableHttpRequest
  ): Promise<RetryableHttpRequest> {
    return super.preRequest(request);
  }

  protected async postRequest<T>(
    response: HttpResponse<T>,
    _: RetryableHttpRequest // eslint-disable-line
  ): Promise<HttpResponse<T>> {
    return super.postRequest<T>(response, _);
  }

  protected async rawRequest<ResponseType>(
    request: RetryableHttpRequest
  ): Promise<HttpResponse<ResponseType>> {
    let retryCount = 0;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const response = await super.rawRequest<ResponseType>(request);

      const retryValidator =
        typeof request.retryValidator === 'function'
          ? request.retryValidator
          : this.retryValidator;

      const shouldRetry =
        request.retryValidator !== false &&
        retryValidator(request, response, retryCount);
      if (!shouldRetry) {
        return response;
      }
      const delayInMs = RetryableHttpClient.calculateRetryDelayInMs(retryCount);
      await sleepPromise(delayInMs);
      retryCount++;
    }
  }

  protected async request<ResponseType>(request: RetryableHttpRequest) {
    return super.request<ResponseType>(request);
  }
}

export type RetryableHttpRequest = HttpRequest &
  HttpRequestRetryValidatorOptions;

export type RetryableHttpRequestOptions = HttpRequestOptions &
  HttpRequestRetryValidatorOptions;

type HttpRequestRetryValidatorOptions = {
  retryValidator?: false | RetryValidator;
};
