// Copyright 2020 Cognite AS
import { beforeAll, beforeEach, describe, expect, test, vi } from 'vitest';

import nock from 'nock';
import BaseCogniteClient from '../baseCogniteClient';

import { AUTHORIZATION_HEADER, BASE_URL } from '../constants';
import { createUniversalRetryValidator } from '../httpClient/retryValidator';
import { sleepPromise } from '../utils';
import { accessToken, project } from './testUtils';

const mockBaseUrl = 'https://example.com';

function setupClient(baseUrl: string = BASE_URL) {
  return new BaseCogniteClient({
    appId: 'JS SDK integration tests',
    project: 'test-project',
    baseUrl,
    oidcTokenProvider: () => Promise.resolve(accessToken),
  });
}

function setupMockableClient(base?: BaseCogniteClient) {
  const client = base || setupClient(mockBaseUrl);
  return client;
}

describe('CogniteClient', () => {
  beforeEach(() => {
    nock.cleanAll();
  });

  describe('constructor', () => {
    test('throw on missing parameter', () => {
      expect(() => {
        // @ts-ignore
        new BaseCogniteClient();
      }).toThrowErrorMatchingInlineSnapshot(
        '[Error: `CogniteClient` is missing parameter `options`]'
      );
    });

    test('missing appId', () => {
      expect(() => {
        // @ts-ignore
        new BaseCogniteClient({});
      }).toThrowErrorMatchingInlineSnapshot(
        '[Error: options.appId is required and must be of type string]'
      );
    });

    test('invalid appId', () => {
      expect(() => {
        // @ts-ignore
        new BaseCogniteClient({ appId: 12 });
      }).toThrowErrorMatchingInlineSnapshot(
        '[Error: options.appId is required and must be of type string]'
      );
    });

    test('missing project', () => {
      expect(() => {
        // @ts-ignore
        new BaseCogniteClient({ appId: 'unit-test' });
      }).toThrowErrorMatchingInlineSnapshot(
        '[Error: options.project is required and must be of type string]'
      );
    });

    test('custom validator retries set to 1 should prevent from retrying a failed call', async () => {
      const scope = nock(mockBaseUrl).get('/').times(2).reply(500, {});
      nock(mockBaseUrl).get('/').reply(200, { a: 42 });
      const client = new BaseCogniteClient({
        appId: 'unit-test',
        project: 'unit-test',
        baseUrl: mockBaseUrl,
        oidcTokenProvider: vi.fn(async () => 'test-token'),
        retryValidator: createUniversalRetryValidator(1),
      });
      await expect(client.get('/')).rejects.toThrowErrorMatchingInlineSnapshot(
        '[Error: Request failed | status code: 500]'
      );
      expect(scope.isDone()).toBeTruthy();
    });

    describe('oidcTokenProvider', () => {
      test('call oidcTokenProvider on 401', async () => {
        nock(mockBaseUrl)
          .get('/test')
          .once()
          .reply(401, { error: { message: 'unauthorized' } })
          .get('/test')
          .reply(200, { body: 'request ok' });

        const oidcTokenProvider = vi.fn().mockResolvedValue('test-token');

        const client = new BaseCogniteClient({
          project,
          appId: 'unit-test',
          baseUrl: mockBaseUrl,
          oidcTokenProvider,
        });

        const result = await client.get('/test');

        expect(result.status).toEqual(200);
        expect(result.data).toEqual({ body: 'request ok' });
        expect(oidcTokenProvider).toHaveBeenCalledTimes(1);
      });

      test('ensure deprecated getToken still works', async () => {
        nock(mockBaseUrl)
          .get('/test')
          .once()
          .reply(401, { error: { message: 'unauthorized' } })
          .get('/test')
          .reply(200, { body: 'request ok' });

        const getToken = vi.fn().mockResolvedValue('test-token');

        const client = new BaseCogniteClient({
          project,
          appId: 'unit-test',
          baseUrl: mockBaseUrl,
          getToken,
        });

        const result = await client.get('/test');

        expect(result.status).toEqual(200);
        expect(result.data).toEqual({ body: 'request ok' });
        expect(getToken).toHaveBeenCalledTimes(1);
      });

      test('oidcTokenProvider rejection should reject sdk requests', async () => {
        const oidcTokenProvider = vi
          .fn()
          .mockRejectedValue(new Error('auth error'));

        nock(mockBaseUrl).get('/test').reply(401, {});

        const client = new BaseCogniteClient({
          project,
          appId: 'unit-test',
          baseUrl: mockBaseUrl,
          oidcTokenProvider,
        });

        await expect(
          client.get('/test')
        ).rejects.toThrowErrorMatchingInlineSnapshot(
          '[Error: Request failed | status code: 401]'
        );

        expect(oidcTokenProvider).toHaveBeenCalledTimes(1);
      });

      test('oidcTokenProvider should be called once for parallel 401s', async () => {
        nock(mockBaseUrl).get('/test').thrice().reply(401);
        nock(mockBaseUrl).get('/test').thrice().reply(200);

        const oidcTokenProvider = vi.fn(async () => {
          await sleepPromise(100);
          return 'test-token';
        });

        const client = new BaseCogniteClient({
          project,
          appId: 'unit-test',
          baseUrl: mockBaseUrl,
          oidcTokenProvider,
        });

        await Promise.all([
          client.get('/test'),
          client.get('/test'),
          client.get('/test'),
        ]);

        expect(oidcTokenProvider).toBeCalledTimes(1);
      });

      test('oidcTokenProvider should be called once for parallel 401s with different response times', async () => {
        nock(mockBaseUrl).get('/test').twice().reply(401);
        nock(mockBaseUrl).get('/test-with-delay').delay(200).reply(401);
        nock(mockBaseUrl).get('/test').twice().reply(200);
        nock(mockBaseUrl).get('/test-with-delay').reply(200);

        const oidcTokenProvider = vi.fn(async () => {
          await sleepPromise(100);
          return 'test-token';
        });

        const client = new BaseCogniteClient({
          project,
          appId: 'unit-test',
          baseUrl: mockBaseUrl,
          oidcTokenProvider,
        });

        await Promise.all([
          client.get('/test'),
          client.get('/test'),
          client.get('/test-with-delay'),
        ]);

        expect(oidcTokenProvider).toBeCalledTimes(1);
      });

      test('oidcTokenProvider should be called more than once for sequential 401s', async () => {
        nock(mockBaseUrl).get('/test').thrice().reply(401);
        nock(mockBaseUrl).get('/test').thrice().reply(200);
        nock(mockBaseUrl).get('/test').reply(401);
        nock(mockBaseUrl).get('/test').reply(200);

        let tokenCount = 0;
        const oidcTokenProvider = vi.fn(async () => {
          await sleepPromise(100);
          return `test-token${tokenCount++}`;
        });

        const client = new BaseCogniteClient({
          project,
          appId: 'unit-test',
          baseUrl: mockBaseUrl,
          oidcTokenProvider,
        });

        await Promise.all([
          client.get('/test'),
          client.get('/test'),
          client.get('/test'),
        ]);

        await client.get('/test');

        expect(oidcTokenProvider).toBeCalledTimes(2);
      });

      test('new token should be used on retry for 401s', async () => {
        nock(mockBaseUrl)
          .get('/test')
          .reply(function () {
            expect(this.req.headers[AUTHORIZATION_HEADER]).toStrictEqual([
              'Bearer test-token0',
            ]);
            return [401];
          });
        nock(mockBaseUrl)
          .get('/test')
          .reply(function () {
            expect(this.req.headers[AUTHORIZATION_HEADER]).toStrictEqual([
              'Bearer test-token1',
            ]);
            return [401];
          });
        nock(mockBaseUrl)
          .get('/test')
          .reply(function () {
            expect(this.req.headers[AUTHORIZATION_HEADER]).toStrictEqual([
              'Bearer test-token2',
            ]);
            return [200];
          });

        let tokenCount = 0;
        const oidcTokenProvider = vi.fn(
          async () => `test-token${tokenCount++}`
        );

        const client = new BaseCogniteClient({
          project,
          appId: 'unit-test',
          baseUrl: mockBaseUrl,
          oidcTokenProvider,
        });

        await client.authenticate();
        await client.get('/test');

        expect(oidcTokenProvider).toBeCalledTimes(3);
      });
    });
  });

  test('getDefaultRequestHeaders() returns clone', () => {
    const client = setupMockableClient();
    const headers = client.getDefaultRequestHeaders();
    headers[AUTHORIZATION_HEADER] = 'overriden';
    const expectedHeaders = { [AUTHORIZATION_HEADER]: accessToken };
    nock(mockBaseUrl, { reqheaders: expectedHeaders }).get('/').reply(200, {});
  });

  describe('authenticated http requests', () => {
    let client: BaseCogniteClient;

    beforeAll(async () => {
      client = setupMockableClient();
    });

    test('get method', async () => {
      nock(mockBaseUrl).get('/').once().reply(200, []);
      const response = await client.get('/');
      expect(response.data).toEqual([]);
    });

    test('post method', async () => {
      nock(mockBaseUrl).post('/').once().reply(200, []);
      const response = await client.post('/');
      expect(response.data).toEqual([]);
    });

    test('put method', async () => {
      nock(mockBaseUrl).put('/').once().reply(200, []);
      const response = await client.put('/', {
        responseType: 'json',
      });
      expect(response.data).toEqual([]);
    });

    test('delete method', async () => {
      nock(mockBaseUrl).delete('/').once().reply(200, 'abc');
      const response = await client.delete('/', { responseType: 'text' });
      expect(response.data).toBe('abc');
    });
  });
});
