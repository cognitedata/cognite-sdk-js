// Copyright 2020 Cognite AS

import inRange from 'lodash/inRange';
import some from 'lodash/some';

import type { HttpMethod, HttpResponse } from './basicHttpClient';
import type { RetryableHttpRequest } from './retryableHttpClient';

/** @hidden */
export type RetryValidator = (
  request: RetryableHttpRequest,
  response: HttpResponse<unknown>,
  retryCount: number,
) => boolean;

/** @hidden */
export type EndpointList = { [key in HttpMethod]?: string[] };

export const MAX_RETRY_ATTEMPTS = 5;

export const createRetryValidator = (
  endpointsToRetry: EndpointList,
  maxRetries: number = MAX_RETRY_ATTEMPTS,
): RetryValidator => {
  const universalRetryValidator = createUniversalRetryValidator(maxRetries);
  return (
    request: RetryableHttpRequest,
    response: HttpResponse<unknown>,
    retryCount: number,
  ) => {
    if (retryCount >= maxRetries) {
      return false;
    }
    if (!isValidRetryStatusCode(response.status)) {
      return false;
    }
    if (universalRetryValidator(request, response, retryCount)) {
      return true;
    }
    const endpoints = endpointsToRetry[request.method] || [];
    if (matchPathWithEndpoints(request.path, endpoints)) {
      return true;
    }
    return false;
  };
};

export const createUniversalRetryValidator =
  (maxRetries: number = MAX_RETRY_ATTEMPTS): RetryValidator =>
  (request, response, retryCount) => {
    if (retryCount >= maxRetries) {
      return false;
    }
    // Always retry http 429 too many requests
    if (response.status === 429) {
      return true;
    }
    const httpMethodsToRetry = ['GET', 'HEAD', 'OPTIONS', 'DELETE', 'PUT'];
    const isRetryableHttpMethod =
      httpMethodsToRetry.indexOf(request.method.toUpperCase()) !== -1;
    if (!isRetryableHttpMethod) {
      return false;
    }
    return isValidRetryStatusCode(response.status);
  };

function isValidRetryStatusCode(status: number) {
  return (
    inRange(status, 100, 200) ||
    inRange(status, 429, 430) ||
    inRange(status, 500, 600)
  );
}

function matchPathWithEndpoints(path: string, endpoints: string[]) {
  return some(endpoints, (endpoint) => matchPathWithEndpoint(path, endpoint));
}

function matchPathWithEndpoint(path: string, endpoint: string) {
  return path.toUpperCase().indexOf(endpoint.toUpperCase()) !== -1;
}
