// Copyright 2020 Cognite AS

import { describe, expect, test } from 'vitest';
import {
  HttpMethod,
  type HttpRequest,
  type HttpResponse,
} from './basicHttpClient';
import { createRetryValidator } from './retryValidator';

describe('cdfRetryValidator', () => {
  const baseRequest = {
    path: '/test',
  };
  const getRequest: HttpRequest = {
    ...baseRequest,
    method: HttpMethod.Get,
  };
  const postRequest: HttpRequest = {
    ...baseRequest,
    method: HttpMethod.Post,
  };
  const postRetryRequest: HttpRequest = {
    ...baseRequest,
    method: HttpMethod.Post,
    path: '/api/v1/projects/abc/assets/list',
  };
  const baseResponse = { data: null, headers: {} };
  const response200: HttpResponse<unknown> = {
    ...baseResponse,
    status: 200,
  };
  const response415: HttpResponse<unknown> = {
    ...baseResponse,
    status: 415,
  };
  const response429: HttpResponse<unknown> = {
    ...baseResponse,
    status: 429,
  };
  const response500: HttpResponse<unknown> = {
    ...baseResponse,
    status: 500,
  };

  const endpointList = {
    [HttpMethod.Post]: ['/assets/list'],
  };
  const retryValidator = createRetryValidator(endpointList, 5);

  test("don't retry 1xx", () => {
    const response100: HttpResponse<unknown> = {
      ...baseResponse,
      status: 100,
    };
    expect(retryValidator(getRequest, response100, 0)).toBeFalsy();
  });

  test("don't retry 2xx", () => {
    expect(retryValidator(getRequest, response200, 0)).toBeFalsy();
  });

  test('only retry reasonable times', () => {
    expect(retryValidator(getRequest, response500, 10)).toBeFalsy();
  });

  test('retry GET 500', () => {
    expect(retryValidator(getRequest, response500, 0)).toBeTruthy();
  });

  test('retry GET 429', () => {
    expect(retryValidator(getRequest, response429, 0)).toBeTruthy();
  });

  test("don't retry generic POST 500", () => {
    expect(retryValidator(postRequest, response500, 0)).toBeFalsy();
  });

  test('retry POST 500 to retryable endpoint', () => {
    expect(retryValidator(postRetryRequest, response500, 0)).toBeTruthy();
  });

  test("don't retry POST 4xx (except 429) to retryable endpoint", () => {
    expect(retryValidator(postRetryRequest, response415, 0)).toBeFalsy();
  });

  test("don't retry GET 4xx (except 429)", () => {
    expect(retryValidator(getRequest, response415, 0)).toBeFalsy();
  });

  test("don't retry POST to path with endpoint as substring prefix", () => {
    const request: HttpRequest = {
      ...baseRequest,
      method: HttpMethod.Post,
      path: '/api/v1/projects/abc/assets/listing',
    };
    expect(retryValidator(request, response500, 0)).toBeFalsy();
  });

  test('retry POST when endpoint matches at path boundary with query string', () => {
    const request: HttpRequest = {
      ...baseRequest,
      method: HttpMethod.Post,
      path: '/api/v1/projects/abc/assets/list?limit=10',
    };
    expect(retryValidator(request, response500, 0)).toBeTruthy();
  });

  test('retry POST when endpoint matches followed by sub-path', () => {
    const dataEndpointList = {
      [HttpMethod.Post]: ['/timeseries/data'],
    };
    const dataRetryValidator = createRetryValidator(dataEndpointList, 5);
    const request: HttpRequest = {
      ...baseRequest,
      method: HttpMethod.Post,
      path: '/api/v1/projects/abc/timeseries/data/list',
    };
    expect(dataRetryValidator(request, response500, 0)).toBeTruthy();
  });
});
