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
  const response502: HttpResponse<unknown> = {
    ...baseResponse,
    status: 502,
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
    expect(retryValidator(getRequest, response502, 10)).toBeFalsy();
  });

  test('retry GET 502', () => {
    expect(retryValidator(getRequest, response502, 0)).toBeTruthy();
  });

  test("don't retry GET 500 (not in status forcelist)", () => {
    expect(retryValidator(getRequest, response500, 0)).toBeFalsy();
  });

  test('retry GET 429', () => {
    expect(retryValidator(getRequest, response429, 0)).toBeTruthy();
  });

  test("don't retry generic POST 502", () => {
    expect(retryValidator(postRequest, response502, 0)).toBeFalsy();
  });

  test('retry POST 502 to retryable endpoint', () => {
    expect(retryValidator(postRetryRequest, response502, 0)).toBeTruthy();
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
    expect(retryValidator(request, response502, 0)).toBeFalsy();
  });

  test('retry POST when endpoint matches at path boundary with query string', () => {
    const request: HttpRequest = {
      ...baseRequest,
      method: HttpMethod.Post,
      path: '/api/v1/projects/abc/assets/list?limit=10',
    };
    expect(retryValidator(request, response502, 0)).toBeTruthy();
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
    expect(dataRetryValidator(request, response502, 0)).toBeTruthy();
  });

  test('only retries 429, 502, 503, 504 status codes', () => {
    const statuses = [429, 500, 501, 502, 503, 504, 505, 599];
    const expected = [true, false, false, true, true, true, false, false];
    const results = statuses.map((status) =>
      retryValidator(
        getRequest,
        { ...baseResponse, status },
        0
      )
    );
    expect(results).toEqual(expected);
  });
});

describe('isAutoRetryable server hint', () => {
  const endpointList = {
    [HttpMethod.Post]: ['/assets/list'],
  };
  const retryValidator = createRetryValidator(endpointList, 5);

  const postRequest: HttpRequest = {
    path: '/api/v1/projects/abc/assets/create',
    method: HttpMethod.Post,
  };
  const baseResponse = { headers: {} };

  test('retry non-retryable POST when server says isAutoRetryable', () => {
    const response: HttpResponse<unknown> = {
      ...baseResponse,
      status: 500,
      data: { error: { code: 500, message: 'err', isAutoRetryable: true } },
    };
    expect(retryValidator(postRequest, response, 0)).toBe(true);
  });

  test('do not retry when isAutoRetryable is false', () => {
    const response: HttpResponse<unknown> = {
      ...baseResponse,
      status: 500,
      data: { error: { code: 500, message: 'err', isAutoRetryable: false } },
    };
    // POST to non-retryable endpoint with isAutoRetryable=false should not retry
    expect(retryValidator(postRequest, response, 0)).toBe(false);
  });

  test('do not retry when isAutoRetryable is absent', () => {
    const response: HttpResponse<unknown> = {
      ...baseResponse,
      status: 500,
      data: { error: { code: 500, message: 'err' } },
    };
    expect(retryValidator(postRequest, response, 0)).toBe(false);
  });

  test('still respect maxRetries even with isAutoRetryable', () => {
    const response: HttpResponse<unknown> = {
      ...baseResponse,
      status: 500,
      data: { error: { code: 500, message: 'err', isAutoRetryable: true } },
    };
    expect(retryValidator(postRequest, response, 10)).toBe(false);
  });
});

describe('suffix-based POST retry (opt-in by path suffix)', () => {
  // Mirrors the pattern used in packages/stable/src/retryValidator.ts where
  // short suffixes like "/list" match any resource (e.g. "/instances/list").
  const suffixEndpoints = {
    [HttpMethod.Post]: [
      '/list',
      '/byids',
      '/search',
      '/aggregate',
      '/query',
      '/filter',
      '/sync',
      '/inspect',
      '/reverselookup',
      '/downloadlink',
      '/initupload',
      '/data',
      '/latest',
      '/delete',
    ],
  };
  const validator = createRetryValidator(suffixEndpoints, 5);

  const baseResponse = { data: null, headers: {} };
  const response502: HttpResponse<unknown> = { ...baseResponse, status: 502 };

  const post = (path: string): HttpRequest => ({
    path,
    method: HttpMethod.Post,
  });

  // All previously hard-coded endpoints are still retried
  const legacyPaths = [
    '/api/v1/projects/x/assets/list',
    '/api/v1/projects/x/assets/byids',
    '/api/v1/projects/x/assets/search',
    '/api/v1/projects/x/events/list',
    '/api/v1/projects/x/files/initupload',
    '/api/v1/projects/x/files/downloadlink',
    '/api/v1/projects/x/timeseries/data',
    '/api/v1/projects/x/timeseries/data/list',
    '/api/v1/projects/x/timeseries/data/latest',
    '/api/v1/projects/x/timeseries/data/delete',
    '/api/v1/projects/x/timeseries/synthetic/query',
  ];

  test.each(legacyPaths)('retries previously-listed %s', (path) => {
    expect(validator(post(path), response502, 0)).toBe(true);
  });

  // New endpoints automatically covered
  const newPaths = [
    '/api/v1/projects/x/instances/list',
    '/api/v1/projects/x/instances/query',
    '/api/v1/projects/x/instances/sync',
    '/api/v1/projects/x/instances/aggregate',
    '/api/v1/projects/x/documents/search',
    '/api/v1/projects/x/containers/delete',
    '/api/v1/projects/x/annotations/reverselookup',
    '/api/v1/projects/x/records/streams/s/records/filter',
  ];

  test.each(newPaths)('retries newly-covered %s', (path) => {
    expect(validator(post(path), response502, 0)).toBe(true);
  });

  // Mutating endpoints are NOT retried
  const unsafePaths = [
    '/api/v1/projects/x/assets',
    '/api/v1/projects/x/assets/update',
    '/api/v1/projects/x/entitymatching/predict',
    '/api/v1/projects/x/sessions/revoke',
  ];

  test.each(unsafePaths)('does NOT retry mutating %s', (path) => {
    expect(validator(post(path), response502, 0)).toBe(false);
  });

  test('suffix must match at path boundary', () => {
    expect(
      validator(post('/api/v1/projects/x/assets/listing'), response502, 0)
    ).toBe(false);
  });
});
