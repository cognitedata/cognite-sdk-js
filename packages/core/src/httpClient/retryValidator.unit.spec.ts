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

  describe('PATCH method retry behavior', () => {
    const patchRequest: HttpRequest = {
      ...baseRequest,
      method: HttpMethod.Patch,
    };
    const response502: HttpResponse<unknown> = { ...baseResponse, status: 502 };

    test('retry PATCH 502', () => {
      expect(retryValidator(patchRequest, response502, 0)).toBeTruthy();
    });

    test("don't retry PATCH 4xx (except 429)", () => {
      expect(retryValidator(patchRequest, response415, 0)).toBeFalsy();
    });

    test('retry PATCH 429', () => {
      expect(retryValidator(patchRequest, response429, 0)).toBeTruthy();
    });
  });

  describe('DELETE method retry behavior', () => {
    const deleteRequest: HttpRequest = {
      ...baseRequest,
      method: HttpMethod.Delete,
    };
    const response502: HttpResponse<unknown> = { ...baseResponse, status: 502 };
    const response503: HttpResponse<unknown> = { ...baseResponse, status: 503 };
    const response504: HttpResponse<unknown> = { ...baseResponse, status: 504 };

    test("don't retry DELETE on 502", () => {
      expect(retryValidator(deleteRequest, response502, 0)).toBeFalsy();
    });

    test("don't retry DELETE on 503", () => {
      expect(retryValidator(deleteRequest, response503, 0)).toBeFalsy();
    });

    test("don't retry DELETE on 504", () => {
      expect(retryValidator(deleteRequest, response504, 0)).toBeFalsy();
    });

    test('retry DELETE on 429', () => {
      expect(retryValidator(deleteRequest, response429, 0)).toBeTruthy();
    });
  });
});
