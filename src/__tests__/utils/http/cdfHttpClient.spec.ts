// Copyright 2019 Cognite AS
import { CogniteError } from '@/error';
import { CDFHttpClient } from '@/utils/http/cdfHttpClient';
import * as nock from 'nock';

describe('CDFHttpClient', () => {
  const baseUrl = 'https://example.com';
  const anotherDomain = 'https://another-domain.com';
  const now = new Date();
  const nowInUnixTimestamp = now.getTime();
  const error400 = { error: { code: 400, message: 'Some message' } };
  // const error401 = { error: { code: 401, message: 'Some message' } };
  let client: CDFHttpClient;
  beforeEach(() => {
    client = new CDFHttpClient(baseUrl);
  });

  describe('get', () => {
    test('convert query parameter arrays to json', async () => {
      nock(baseUrl)
        .get('/')
        .query({ assetIds: '[123,456]' })
        .reply(200, {});
      await client.get('/', { params: { assetIds: [123, 456] } });
    });

    test('use configured bearer token', async () => {
      client.setBearerToken('abc');
      nock(baseUrl, { reqheaders: { authorization: 'Bearer abc' } })
        .get('/')
        .reply(200, {});
      await client.get('/');
    });

    test('dont expose bearer token to other domains', async () => {
      client.setBearerToken('abc');
      nock(anotherDomain, { badheaders: ['authorization'] })
        .get('/')
        .reply(200, {});
      await client.get(anotherDomain);
    });

    test('dont expose api-key to other domains', async () => {
      client.setDefaultHeader('api-key', '123');
      nock(anotherDomain, { badheaders: ['api-key'] })
        .get('/')
        .reply(200, {});
      await client.get(anotherDomain);
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

    test('transform Date in query param to unix timestamp', async () => {
      nock(baseUrl)
        .get('/')
        .query({ time: nowInUnixTimestamp })
        .reply(200, {});
      await client.get('/', { params: { time: now } });
    });

    test('transform unix timestamp in response to Date', async () => {
      nock(baseUrl)
        .get('/')
        .reply(200, { createdTime: nowInUnixTimestamp });
      const response = await client.get<{ createdTime: Date }>('/');
      expect(response.data.createdTime).toEqual(now);
    });

    test('throw custom cognite http error', async () => {
      nock(baseUrl)
        .get('/')
        .reply(400, error400);
      expect.assertions(1);
      try {
        await client.get('/');
      } catch (err) {
        expect(err).toBeInstanceOf(CogniteError);
      }
    });

    test('throw custom cognite error with populated message', async () => {
      nock(baseUrl)
        .get('/')
        .reply(400, error400);
      await expect(client.get('/')).rejects.toThrowErrorMatchingInlineSnapshot(
        `"Some message | code: 400"`
      );
    });

    test('throw custom cognite error with populated status code', async () => {
      nock(baseUrl)
        .get('/')
        .reply(400, error400);
      expect.assertions(1);
      try {
        await client.get('/');
      } catch (err) {
        expect(err.status).toBe(400);
      }
    });

    // test('set custom not authenticated handler', async () => {
    //   const mockFunction = jest.fn();
    //   client.setNotAuthenticatedHandler(mockFunction);
    //   nock(baseUrl)
    //     .get('/')
    //     .reply(401, {});
    //   client.get('/');
    //   expect(mockFunction).toHaveBeenCalledTimes(1);
    // });
  });

  describe('post', () => {
    test('transform Date in body to unix timestamp', async () => {
      nock(baseUrl)
        .post('/', { time: nowInUnixTimestamp })
        .reply(200, {});
      await client.post('/', { data: { time: now } });
    });
  });
});
