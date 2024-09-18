// Copyright 2020 Cognite AS

import nock from 'nock';
import { beforeEach, describe, expect, test } from 'vitest';
import { HttpError } from './httpError';
import { RetryableHttpClient } from './retryableHttpClient';

describe('RetryableHttpClient', () => {
  const baseUrl = 'https://example.com';
  let client: RetryableHttpClient;
  beforeEach(() => {
    client = new RetryableHttpClient(
      baseUrl,
      (_, response) => response.status === 500
    );
    nock.cleanAll();
  });

  test('should retry', async () => {
    const scope = nock(baseUrl).get('/').times(2).reply(500, {});
    nock(baseUrl).get('/').reply(200, { a: 42 });
    const res = await client.get('/');
    expect(scope.isDone()).toBeTruthy();
    expect(res.status).toBe(200);
    expect(res.data).toEqual({ a: 42 });
  });

  test("shouldn't retry", async () => {
    nock(baseUrl).get('/').reply(200, { a: 42 });
    const res = await client.get('/');
    expect(res.status).toBe(200);
    expect(res.data).toEqual({ a: 42 });
  });

  test('throw on 400 after retry', async () => {
    expect.assertions(1);
    nock(baseUrl).get('/').times(2).reply(500, {});
    nock(baseUrl).get('/').reply(400, { a: 42 });
    await expect(client.get('/')).rejects.toThrow(
      'Request failed | status code: 400'
    );
  });

  test('respect when a boolean is passed as retryValidator', async () => {
    const scope = nock(baseUrl).get('/').times(1).reply(401);
    expect.assertions(2);
    try {
      const promise = client.get('/', { retryValidator: false });
      await promise;
    } catch (err) {
      if (!(err instanceof HttpError)) {
        throw err;
      }
      expect(err.status).toBe(401);
    }
    expect(scope.isDone()).toBe(true);
  });

  test('respect when a function is passed as retryValidator', async () => {
    const scope = nock(baseUrl).get('/').times(2).reply(401);
    expect.assertions(2);
    try {
      await client.get('/', {
        retryValidator: (_, __, retryCount) => retryCount < 1,
      });
    } catch (err) {
      if (!(err instanceof HttpError)) {
        throw err;
      }
      expect(err.status).toBe(401);
    }
    expect(scope.isDone()).toBe(true);
  });
});
