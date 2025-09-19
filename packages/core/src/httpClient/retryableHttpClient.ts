// Copyright 2020 Cognite AS

import isFunction from 'lodash/isFunction';
import { sleepPromise } from '../utils';
import {
  BasicHttpClient,
  type HttpRequest,
  type HttpRequestOptions,
  type HttpResponse,
} from './basicHttpClient';
import { ExponentialJitterBackoff } from './exponentialJitterBackoff';
import { MAX_RETRY_ATTEMPTS, type RetryValidator } from './retryValidator';

/**
 * The `RetryableHttpClient` class extends the functionality of a basic HTTP client
 * by adding automatic retry logic for failed requests. This is particularly useful
 * for improving the resilience of applications that depend on unreliable network
 * connections or external services that may experience intermittent failures.
 *
 * This class includes methods for:
 * - Configuring retry policies, including the number of retries and delay between retries.
 * - Making HTTP requests with automatic retries on failure.
 * - Handling different types of HTTP responses and errors.
 *
 * The `RetryableHttpClient` is designed to be used in scenarios where you need to
 * make HTTP requests that may occasionally fail and need to be retried. It ensures
 * that transient errors do not cause the application to fail, improving overall
 * reliability and user experience.
 *
 * @remarks
 * This class builds on top of a basic HTTP client and adds retry logic. It uses
 * custom error handling and response parsing methods to ensure that retries are
 * only attempted for transient errors and not for permanent failures.
 *
 * @see {@link BasicHttpClient}
 * @see {@link HttpError}
 * @see {@link HttpHeaders}
 * @see {@link HttpResponseType}
 */
export class RetryableHttpClient extends BasicHttpClient {
  private static calculateRetryDelayInMs(retryCount: number) {
    const backoff = new ExponentialJitterBackoff();
    return backoff.calculateDelayInMs(retryCount);
  }

  constructor(
    baseUrl: string,
    private retryValidator: RetryValidator
  ) {
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
    request: RetryableHttpRequest,
    mutatedRequest: RetryableHttpRequest
  ): Promise<HttpResponse<T>> {
    return super.postRequest<T>(response, request, mutatedRequest);
  }

  protected async rawRequest<ResponseType>(
    request: RetryableHttpRequest
  ): Promise<HttpResponse<ResponseType>> {
    let retryCount = 0;
    while (true) {
      const response = await super.rawRequest<ResponseType>(request);

      const retryValidator = isFunction(request.retryValidator)
        ? request.retryValidator
        : this.retryValidator;

      const shouldRetry =
        retryCount < MAX_RETRY_ATTEMPTS &&
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
