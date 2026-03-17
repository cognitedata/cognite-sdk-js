// Copyright 2020 Cognite AS

import inRange from 'lodash/inRange';
import some from 'lodash/some';

import type { HttpMethod, HttpResponse } from './basicHttpClient';
import type { HttpErrorData } from './httpError';
import type { RetryableHttpRequest } from './retryableHttpClient';

/** @hidden */
export type RetryValidator = (
  request: RetryableHttpRequest,
  response: HttpResponse<unknown>,
  retryCount: number
) => boolean;

/** @hidden */
export type EndpointList = { [key in HttpMethod]?: string[] };

export const MAX_RETRY_ATTEMPTS = 5;

export const createRetryValidator = (
  endpointsToRetry: EndpointList,
  maxRetries: number = MAX_RETRY_ATTEMPTS
): RetryValidator => {
  const universalRetryValidator = createUniversalRetryValidator(maxRetries);
  return (
    request: RetryableHttpRequest,
    response: HttpResponse<unknown>,
    retryCount: number
  ) => {
    if (retryCount >= maxRetries) {
      return false;
    }
    if (!isValidRetryStatusCode(response.status)) {
      return false;
    }
    // Honor server-side isAutoRetryable hint from the API response
    if (getIsAutoRetryable(response) === true) {
      return true;
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
    // Always retry http 429 (Too Many Requests)
    if (response.status === 429) {
      return true;
    }
    // Honor server-side isAutoRetryable hint from the API response
    if (getIsAutoRetryable(response) === true) {
      return true;
    }
    // By default, retry requests with HTTP verbs that are meant to be idempotent
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
    inRange(status, 429, 430) ||
    inRange(status, 500, 600)
  );
}

function matchPathWithEndpoints(path: string, endpoints: string[]) {
  return some(endpoints, (endpoint) => matchPathWithEndpoint(path, endpoint));
}

function getIsAutoRetryable(
  response: HttpResponse<unknown>
): boolean | undefined {
  try {
    return (response.data as HttpErrorData)?.error?.isAutoRetryable;
  } catch {
    return undefined;
  }
}

function matchPathWithEndpoint(path: string, endpoint: string) {
  const upperPath = path.toUpperCase();
  const upperEndpoint = endpoint.toUpperCase();
  const index = upperPath.indexOf(upperEndpoint);
  if (index === -1) {
    return false;
  }
  const endPos = index + upperEndpoint.length;
  return (
    endPos === upperPath.length ||
    upperPath[endPos] === '/' ||
    upperPath[endPos] === '?'
  );
}
