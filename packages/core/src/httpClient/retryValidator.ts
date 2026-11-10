// Copyright 2020 Cognite AS

import some from 'lodash/some';

import type { HttpMethod, HttpResponse } from './basicHttpClient';
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
    // By default, retry requests with HTTP verbs that are meant to be idempotent
    const httpMethodsToRetry = ['GET', 'HEAD', 'OPTIONS', 'DELETE', 'PUT'];
    const isRetryableHttpMethod =
      httpMethodsToRetry.indexOf(request.method.toUpperCase()) !== -1;
    if (!isRetryableHttpMethod) {
      return false;
    }
    return isValidRetryStatusCode(response.status);
  };

const RETRYABLE_STATUS_CODES = new Set([429, 502, 503, 504]);

function isValidRetryStatusCode(status: number) {
  return RETRYABLE_STATUS_CODES.has(status);
}

function matchPathWithEndpoints(path: string, endpoints: string[]) {
  return some(endpoints, (endpoint) => matchPathWithEndpoint(path, endpoint));
}

// Matches when `endpoint` occurs anywhere in `path`, ignoring case. A `*`
// in `endpoint` matches one path segment, for endpoints with a path
// parameter such as '/functions/*/calls/list'.
function matchPathWithEndpoint(path: string, endpoint: string) {
  if (!endpoint.includes('*')) {
    return path.toUpperCase().indexOf(endpoint.toUpperCase()) !== -1;
  }
  const pattern = endpoint
    .split('*')
    .map((part) => part.replace(/[.+?^${}()|[\]\\]/g, '\\$&'))
    .join('[^/]+');
  return new RegExp(pattern, 'i').test(path);
}
