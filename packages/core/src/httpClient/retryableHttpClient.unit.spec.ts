// Copyright 2020 Cognite AS

import nock from 'nock';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { sleepPromise } from '../utils';
import { BasicHttpClient } from './basicHttpClient';
import { HttpError } from './httpError';
import { DEFAULT_RETRY_CONFIG } from './retryTracker';
import { RetryableHttpClient } from './retryableHttpClient';

vi.mock('../utils', async (importOriginal) => {
  const mod = await importOriginal<typeof import('../utils')>();
  return { ...mod, sleepPromise: vi.fn().mockResolvedValue(undefined) };
});

describe('RetryableHttpClient', () => {
  const baseUrl = 'https://example.com';
  let client: RetryableHttpClient;
  beforeEach(() => {
    client = new RetryableHttpClient(
      baseUrl,
      (_, response) => response.status === 500
    );
    nock.cleanAll();
    vi.mocked(sleepPromise).mockClear();
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
    const scope = nock(baseUrl).get('/').times(1).reply(429);
    expect.assertions(2);
    try {
      const promise = client.get('/', { retryValidator: false });
      await promise;
    } catch (err) {
      if (!(err instanceof HttpError)) {
        throw err;
      }
      expect(err.status).toBe(429);
    }
    expect(scope.isDone()).toBe(true);
  });

  test('respect when a function is passed as retryValidator', async () => {
    const scope = nock(baseUrl).get('/').times(2).reply(429);
    expect.assertions(2);
    try {
      await client.get('/', {
        retryValidator: (_, __, retryCount) => retryCount < 1,
      });
    } catch (err) {
      if (!(err instanceof HttpError)) {
        throw err;
      }
      expect(err.status).toBe(429);
    }
    expect(scope.isDone()).toBe(true);
  });

  test('should retry non-retryable status when isAutoRetryable is true and retryValidator is true', async () => {
    const scope = nock(baseUrl)
      .get('/')
      .reply(400, {
        error: { code: 400, message: 'Bad request', isAutoRetryable: true },
      });
    nock(baseUrl).get('/').reply(200, { a: 42 });
    const res = await client.get('/', {
      retryValidator: () => true,
    });
    expect(scope.isDone()).toBeTruthy();
    expect(res.status).toBe(200);
    expect(res.data).toEqual({ a: 42 });
  });

  test('should respect MAX_RETRY_ATTEMPTS even when isAutoRetryable is true', async () => {
    nock(baseUrl)
      .get('/')
      .times(11)
      .reply(429, {
        error: { code: 429, message: 'Bad request', isAutoRetryable: true },
      });
    await expect(client.get('/')).rejects.toThrow(
      'Request failed | status code: 429'
    );
  });

  test('should fall through to normal retry validation when isAutoRetryable is false', async () => {
    nock(baseUrl)
      .get('/')
      .reply(400, {
        error: { code: 400, message: 'Bad request', isAutoRetryable: false },
      });
    await expect(client.get('/')).rejects.toThrow(
      'Request failed | status code: 400'
    );
  });

  test('should fall through to normal retry validation when isAutoRetryable is missing', async () => {
    nock(baseUrl)
      .get('/')
      .reply(400, { error: { code: 400, message: 'Bad request' } });
    await expect(client.get('/')).rejects.toThrow(
      'Request failed | status code: 400'
    );
  });

  test('should not retry when retryValidator is false even if isAutoRetryable is true', async () => {
    const scope = nock(baseUrl)
      .get('/')
      .times(1)
      .reply(400, {
        error: { code: 400, message: 'Bad request', isAutoRetryable: true },
      });
    expect.assertions(2);
    try {
      await client.get('/', { retryValidator: false });
    } catch (err) {
      if (!(err instanceof HttpError)) {
        throw err;
      }
      expect(err.status).toBe(400);
    }
    expect(scope.isDone()).toBe(true);
  });

  describe('network error retries', () => {
    type RawRequestResult =
      | { error: unknown }
      | { status: number; data: unknown; headers: Record<string, string> };

    function mockRawRequestSequence(...results: RawRequestResult[]) {
      const spy = vi.spyOn(BasicHttpClient.prototype, 'rawRequest' as never);
      for (const result of results) {
        if ('error' in result) {
          spy.mockRejectedValueOnce(result.error);
        } else {
          spy.mockResolvedValueOnce(result);
        }
      }
      return spy;
    }

    const ok = { status: 200, data: { a: 42 }, headers: {} } as const;

    test('should retry on connection error and succeed', async () => {
      const spy = mockRawRequestSequence(
        { error: new TypeError('fetch failed') },
        ok
      );
      const res = await client.get('/');
      expect(res.status).toBe(200);
      expect(res.data).toEqual({ a: 42 });
      expect(spy).toHaveBeenCalledTimes(2);
      spy.mockRestore();
    });

    test('should retry on read timeout and succeed', async () => {
      const abortError = new DOMException(
        'The operation was aborted',
        'AbortError'
      );
      const spy = mockRawRequestSequence({ error: abortError }, ok);
      const res = await client.get('/');
      expect(res.status).toBe(200);
      expect(res.data).toEqual({ a: 42 });
      expect(spy).toHaveBeenCalledTimes(2);
      spy.mockRestore();
    });

    test('should exhaust maxRetriesConnect then re-throw', async () => {
      const connectionError = new TypeError('fetch failed');
      const { maxRetriesConnect } = DEFAULT_RETRY_CONFIG;
      const errors = Array.from({ length: maxRetriesConnect }, () => ({
        error: connectionError,
      }));
      const spy = mockRawRequestSequence(...errors);
      await expect(client.get('/')).rejects.toThrow(connectionError);
      expect(spy).toHaveBeenCalledTimes(maxRetriesConnect);
      spy.mockRestore();
    });

    test('should exhaust maxRetriesRead then re-throw', async () => {
      const abortError = new DOMException(
        'The operation was aborted',
        'AbortError'
      );
      const { maxRetriesRead } = DEFAULT_RETRY_CONFIG;
      const errors = Array.from({ length: maxRetriesRead }, () => ({
        error: abortError,
      }));
      const spy = mockRawRequestSequence(...errors);
      await expect(client.get('/')).rejects.toThrow(abortError);
      expect(spy).toHaveBeenCalledTimes(maxRetriesRead);
      spy.mockRestore();
    });

    test('should NOT retry non-network errors', async () => {
      const syntaxError = new SyntaxError('Unexpected token');
      const spy = mockRawRequestSequence({ error: syntaxError });
      await expect(client.get('/')).rejects.toThrow(syntaxError);
      expect(spy).toHaveBeenCalledTimes(1);
      spy.mockRestore();
    });

    test('should NOT retry non-Error throws', async () => {
      const spy = mockRawRequestSequence({ error: 'string error' });
      await expect(client.get('/')).rejects.toBe('string error');
      expect(spy).toHaveBeenCalledTimes(1);
      spy.mockRestore();
    });

    test('should apply backoff delay between network error retries', async () => {
      const spy = mockRawRequestSequence(
        { error: new TypeError('fetch failed') },
        { error: new TypeError('fetch failed') },
        ok
      );
      await client.get('/');
      expect(sleepPromise).toHaveBeenCalledTimes(2);
      for (const call of vi.mocked(sleepPromise).mock.calls) {
        expect(call[0]).toBeGreaterThanOrEqual(0);
      }
      spy.mockRestore();
    });
  });
});
