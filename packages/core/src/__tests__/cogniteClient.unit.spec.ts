// Copyright 2020 Cognite AS

import nock from 'nock';
import BaseCogniteClient from '../baseCogniteClient';

import { API_KEY_HEADER, AUTHORIZATION_HEADER, BASE_URL } from '../constants';
import { apiKey, project } from '../testUtils';

const mockBaseUrl = 'https://example.com';

function setupClient(baseUrl: string = BASE_URL) {
  return new BaseCogniteClient({
    appId: 'JS SDK integration tests',
    project: 'test-project',
    baseUrl,
    credentials: {
      method: 'api',
      apiKey,
    },
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
        `"\`CogniteClient\` is missing parameter \`options\`"`
      );
    });

    test('missing appId', () => {
      expect(() => {
        // @ts-ignore
        new BaseCogniteClient({});
      }).toThrowErrorMatchingInlineSnapshot(
        `"options.appId is required and must be of type string"`
      );
    });

    test('invalid appId', () => {
      expect(() => {
        // @ts-ignore
        new BaseCogniteClient({ appId: 12 });
      }).toThrowErrorMatchingInlineSnapshot(
        `"options.appId is required and must be of type string"`
      );
    });

    test('missing project', () => {
      expect(() => {
        // @ts-ignore
        new BaseCogniteClient({ appId: 'unit-test' });
      }).toThrowErrorMatchingInlineSnapshot(
        `"options.project is required and must be of type string"`
      );
    });

    describe('credentials', () => {
      test('missing credentials', () => {
        expect(() => {
          // @ts-ignore
          new BaseCogniteClient({ appId: 'unit-test', project: 'unit-test' });
        }).toThrowErrorMatchingInlineSnapshot(
          `"options.credentials is required"`
        );
      });
      test('call credentials on 401', async () => {
        nock(mockBaseUrl).get('/test').reply(401, {});
        const scopeOk = nock(mockBaseUrl)
          .persist()
          .get('/test')
          .reply(200, { body: 'request ok' });

        const client = new BaseCogniteClient({
          project,
          appId: 'unit-test',
          baseUrl: mockBaseUrl,
          credentials: {
            method: 'api',
            apiKey: '401-test-token',
          },
        });

        const result = await client.get('/test');

        expect(result.status).toEqual(200);
        expect(result.data).toEqual({ body: 'request ok' });

        scopeOk.done();
      });

      test('401 handler should reject if the same token is returned', async () => {
        const scope = nock(mockBaseUrl).get('/test').twice().reply(401, {});

        const client = new BaseCogniteClient({
          project,
          appId: 'unit-test',
          baseUrl: mockBaseUrl,
          credentials: {
            method: 'api',
            apiKey: '401-test-token',
          },
        });

        await expect(
          async () => await client.get('/test')
        ).rejects.toThrowErrorMatchingInlineSnapshot(
          `"Request failed | status code: 401"`
        );

        scope.done();
      });

      test('credentials rejection should reject sdk requests', async () => {
        nock(mockBaseUrl).get('/test').twice().reply(401, {});

        const client = new BaseCogniteClient({
          project,
          appId: 'unit-test',
          baseUrl: mockBaseUrl,
          credentials: {
            method: 'api',
            apiKey: '401-test-token',
          },
        });

        await expect(
          async () => await client.get('/test')
        ).rejects.toThrowErrorMatchingInlineSnapshot(
          `"Request failed | status code: 401"`
        );
      });
    });

    test('apiKeyMode should change request header and token preable', async () => {
      nock(mockBaseUrl).get('/test').reply(401, {});
      nock(mockBaseUrl, {
        reqheaders: {
          [API_KEY_HEADER]: 'test-api-key',
        },
      })
        .get('/test')
        .reply(200, { body: 'api key request ok' });

      nock(mockBaseUrl, {
        reqheaders: {
          [AUTHORIZATION_HEADER]: 'Bearer 401-test-token',
        },
      })
        .get('/test')
        .reply(200, { body: 'normal token request ok' });

      const client = new BaseCogniteClient({
        project,
        appId: 'unit-test',
        baseUrl: mockBaseUrl,
        credentials: {
          method: 'api',
          apiKey: 'test-api-key',
        },
      });

      const result = await client.get('/test');

      expect(result.status).toEqual(200);
      expect(result.data).toEqual({ body: 'api key request ok' });
    });
  });

  test('getDefaultRequestHeaders() returns clone', () => {
    const client = setupMockableClient();
    const headers = client.getDefaultRequestHeaders();
    headers[API_KEY_HEADER] = 'overriden';
    const expectedHeaders = { [API_KEY_HEADER]: apiKey };
    nock(mockBaseUrl, { reqheaders: expectedHeaders }).get('/').reply(200, {});
  });

  describe('http requests', () => {
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
