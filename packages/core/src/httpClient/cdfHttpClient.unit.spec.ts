// Copyright 2020 Cognite AS
import { beforeEach, describe, expect, test, vi } from 'vitest';
import nock from 'nock';
import { API_KEY_HEADER, AUTHORIZATION_HEADER } from '../constants';
import { CogniteError } from '../error';
import { bearerString } from '../utils';
import { CDFHttpClient } from './cdfHttpClient';
import { createUniversalRetryValidator } from './retryValidator';

describe('CDFHttpClient', () => {
  const baseUrl = 'https://example.com';
  const anotherDomain = 'https://another-domain.com';
  const error400 = { error: { code: 400, message: 'Some message' } };
  const error401 = { error: { code: 401, message: 'Some message' } };
  let client: CDFHttpClient;
  beforeEach(() => {
    client = new CDFHttpClient(baseUrl, createUniversalRetryValidator());
    nock.cleanAll();
  });

  describe('get', () => {
    test('convert query parameter arrays to json', async () => {
      nock(baseUrl).get('/').query({ assetIds: '[123,456]' }).reply(200, {});
      await client.get('/', { params: { assetIds: [123, 456] } });
    });

    test('use configured bearer token', async () => {
      const token = 'abc';
      client.setBearerToken(token);
      nock(baseUrl, { reqheaders: { authorization: bearerString(token) } })
        .get('/')
        .reply(200, {});
      await client.get('/');
    });

    test('dont expose bearer token to other domains', async () => {
      client.setBearerToken('abc');
      nock(anotherDomain, { badheaders: [AUTHORIZATION_HEADER] })
        .get('/')
        .reply(200, {});
      await client.get(anotherDomain);
    });

    test('dont expose api-key to other domains', async () => {
      client.setDefaultHeader(API_KEY_HEADER, '123');
      nock(anotherDomain, { badheaders: [API_KEY_HEADER] })
        .get('/')
        .reply(200, {});
      await client.get(anotherDomain);
    });

    test('send bearer token to other doman when withCredentials == true', async () => {
      const token = 'abc';
      client.setBearerToken(token);
      nock(anotherDomain, {
        reqheaders: { [AUTHORIZATION_HEADER]: bearerString(token) },
      })
        .get('/')
        .reply(200, {});
      await client.get(anotherDomain, { withCredentials: true });
    });

    test('send api-key to other doman when withCredentials == true', async () => {
      const apiKey = '123';
      client.setDefaultHeader(API_KEY_HEADER, apiKey);
      nock(anotherDomain, { reqheaders: { [API_KEY_HEADER]: apiKey } })
        .get('/')
        .reply(200, {});
      await client.get(anotherDomain, { withCredentials: true });
    });

    test('dont expose x-cdp-* to other domains', async () => {
      client.setDefaultHeader('x-cdp-app', '123');
      client.setDefaultHeader('x-cdp-sdk', 'abc');
      nock(anotherDomain, {
        badheaders: ['x-cdp-app', 'x-cdp-sdk'],
      })
        .get('/')
        .reply(200, {});
      await client.get(anotherDomain);
    });

    test('throw custom cognite http error', async () => {
      nock(baseUrl).get('/').reply(400, error400);
      expect.assertions(1);
      try {
        await client.get('/');
      } catch (err) {
        expect(err).toBeInstanceOf(CogniteError);
      }
    });

    test('throw custom cognite error with populated message', async () => {
      nock(baseUrl).get('/').reply(400, error400);
      await expect(client.get('/')).rejects.toThrowErrorMatchingInlineSnapshot(
        `[Error: Some message | code: 400]`
      );
    });

    test('throw custom cognite error with populated status code', async () => {
      nock(baseUrl).get('/').reply(400, error400);
      expect.assertions(1);
      try {
        await client.get('/');
      } catch (err) {
        expect(err.status).toBe(400);
      }
    });

    describe('response401Handler', () => {
      test('throw on 401 with default handler', async () => {
        nock(baseUrl).get('/').reply(401, error401);
        expect.assertions(1);
        try {
          await client.get('/');
        } catch (err) {
          expect(err.status).toBe(401);
        }
      });

      test('set custom 401 handler', () =>
        new Promise((done) => {
          nock(baseUrl).get('/').reply(401, error401);
          client.set401ResponseHandler((err) => {
            expect(err.status).toBe(401);
            done(null);
          });
          client.get('/');
        }));

      test('respect reject call', async () => {
        nock(baseUrl).get('/').reply(401, error401);
        client.set401ResponseHandler((_, __, ___, reject) => {
          reject();
        });
        await expect(client.get('/')).rejects.toMatchInlineSnapshot(
          `[Error: Request failed | status code: 401]`
        );
      });

      test('respect retry call', async () => {
        const scope = nock(baseUrl).get('/').reply(401, error401);
        nock(baseUrl).get('/').reply(200, {});
        client.set401ResponseHandler((_, __, retry) => {
          retry();
        });
        expect((await client.get('/')).status).toBe(200);
        expect(scope.isDone()).toBeTruthy();
      });

      function checkIfThrows401(url: string) {
        return async () => {
          nock(baseUrl).get(url).reply(401, error401);
          const mockFn = vi.fn();
          client.set401ResponseHandler(mockFn);
          await expect(
            client.get(url)
          ).rejects.toThrowErrorMatchingInlineSnapshot(
            `[Error: Some message | code: 401]`
          );
          expect(mockFn).not.toBeCalled();
        };
      }

      test('ignore errors to /login/status', checkIfThrows401('/login/status'));

      test('ignore errors to /logout/url', checkIfThrows401('/logout/url'));
    });
  });

  describe('handle one time headers', () => {
    test('should send header once', async () => {
      const headerKey = 'test';
      const headerValue = '123';
      client.addOneTimeHeader(headerKey, headerValue);
      nock(baseUrl, { reqheaders: { [headerKey]: headerValue } })
        .put('/')
        .reply(200, {});
      nock(baseUrl, { badheaders: [headerKey] })
        .put('/')
        .reply(200, {});
      await client.put(baseUrl);
      await client.put(baseUrl);
    });

    test('should send it after retry', async () => {
      const headerKey = 'test';
      const headerValue = '123';
      client.addOneTimeHeader(headerKey, headerValue);
      nock(baseUrl, { reqheaders: { [headerKey]: headerValue } })
        .delete('/')
        .reply(101, {});
      nock(baseUrl, { reqheaders: { [headerKey]: headerValue } })
        .delete('/')
        .reply(200, [1]);
      nock(baseUrl, { badheaders: [headerKey] })
        .delete('/')
        .reply(200, {});
      const res = await client.delete(baseUrl);
      expect(res.data).toEqual([1]);
      await client.delete(baseUrl);
    });
  });
});
