// Copyright 2020 Cognite AS
import { inRange, some } from 'lodash';
import { HttpMethod } from './basicHttpClient';
import { RetryValidator } from './retryableHttpClient';

const MAX_RETRY_ATTEMPTS = 5;

const cdfEndpointsToRetry: { [key: string]: string[] } = {
  [HttpMethod.Post]: [
    '/assets/list',
    '/assets/byids',
    '/assets/search',
    '/events/list',
    '/events/byids',
    '/events/search',
    '/files/list',
    '/files/byids',
    '/files/search',
    '/files/initupload',
    '/files/downloadlink',
    '/timeseries/byids',
    '/timeseries/search',
    '/timeseries/data',
    '/timeseries/data/list',
    '/timeseries/data/latest',
    '/timeseries/data/delete',
  ],
};

export const cdfRetryValidator: RetryValidator = (
  request,
  response,
  retryCount
) => {
  if (retryCount >= MAX_RETRY_ATTEMPTS) {
    return false;
  }
  if (!isValidRetryStatusCode(response.status)) {
    return false;
  }
  if (universalRetryValidator(request, response, retryCount)) {
    return true;
  }
  const endpoints = cdfEndpointsToRetry[request.method] || [];
  if (matchPathWithEndpoints(request.path, endpoints)) {
    return true;
  }
  return false;
};

const universalRetryValidator: RetryValidator = (
  request,
  response,
  retryCount
) => {
  if (retryCount >= MAX_RETRY_ATTEMPTS) {
    return false;
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
  return some(endpoints, endpoint => matchPathWithEndpoint(path, endpoint));
}

function matchPathWithEndpoint(path: string, endpoint: string) {
  return path.toUpperCase().indexOf(endpoint.toUpperCase()) !== -1;
}
