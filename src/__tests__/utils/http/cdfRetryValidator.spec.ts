// Copyright 2019 Cognite AS
import {
  HttpMethod,
  HttpRequest,
  HttpResponse,
} from '../../../utils/http/basicHttpClient';
import { cdfRetryValidator } from '../../../utils/http/cdfRetryValidator';

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
  const response200: HttpResponse<any> = {
    ...baseResponse,
    status: 200,
  };
  const response415: HttpResponse<any> = {
    ...baseResponse,
    status: 415,
  };
  const response429: HttpResponse<any> = {
    ...baseResponse,
    status: 429,
  };
  const response500: HttpResponse<any> = {
    ...baseResponse,
    status: 500,
  };

  test("don't retry 2xx", () => {
    expect(cdfRetryValidator(getRequest, response200, 0)).toBeFalsy();
  });

  test('only retry reasonable times', () => {
    expect(cdfRetryValidator(getRequest, response500, 10)).toBeFalsy();
  });

  test('retry GET 500', () => {
    expect(cdfRetryValidator(getRequest, response500, 0)).toBeTruthy();
  });

  test('retry GET 429', () => {
    expect(cdfRetryValidator(getRequest, response429, 0)).toBeTruthy();
  });

  test("don't retry generic POST 500", () => {
    expect(cdfRetryValidator(postRequest, response500, 0)).toBeFalsy();
  });

  test('retry POST 500 to retryable endpoint', () => {
    expect(cdfRetryValidator(postRetryRequest, response500, 0)).toBeTruthy();
  });

  test("don't retry POST 4xx (except 429) to retryable endpoint", () => {
    expect(cdfRetryValidator(postRetryRequest, response415, 0)).toBeFalsy();
  });

  test("don't retry GET 4xx (except 429)", () => {
    expect(cdfRetryValidator(getRequest, response415, 0)).toBeFalsy();
  });
});
