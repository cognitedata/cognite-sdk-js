// Copyright 2020 Cognite AS

import { beforeEach, describe, expect, test } from 'vitest';

import nock from 'nock';
import { BasicHttpClient, HttpResponseType } from './basicHttpClient';
import { HttpError } from './httpError';

describe('BasicHttpClient', () => {
  const baseUrl = 'https://example.com';
  const header = { name: 'x-some-header', value: 'some-value' };
  let client: BasicHttpClient;
  beforeEach(() => {
    client = new BasicHttpClient(baseUrl);
    nock.cleanAll();
  });

  describe('setDefaultHeader', () => {
    test('should set default header', async () => {
      client.setDefaultHeader(header.name, header.value);
      nock(baseUrl, { reqheaders: { [header.name]: header.value } })
        .post('/')
        .reply(200, {});
      await client.post('/');
      expect(client.getDefaultHeaders()).toMatchObject({
        [header.name]: header.value,
      });
    });

    test('override default header', async () => {
      client.setDefaultHeader(header.name, 'another-value');
      client.setDefaultHeader(header.name, header.value);
      nock(baseUrl, { reqheaders: { [header.name]: header.value } })
        .post('/')
        .reply(200, {});
      await client.post('/');
      expect(client.getDefaultHeaders()).toMatchObject({
        [header.name]: header.value,
      });
    });
  });

  describe('get', () => {
    test('use correct base url', async () => {
      nock(baseUrl).get('/').reply(200, {});
      await client.get('');
    });

    test('use correct path', async () => {
      const path = '/abc/def';
      nock(baseUrl).get(path).reply(200, {});
      await client.get(path);
    });

    test('handle json response', async () => {
      nock(baseUrl).get('/').reply(200, { a: 42 });
      const response = await client.get('/');
      expect(response.data).toEqual({ a: 42 });
    });

    test('handle text response', async () => {
      nock(baseUrl).get('/').reply(200, 'hello');
      const response = await client.get<string>('/', {
        responseType: HttpResponseType.Text,
      });
      expect(response.data).toBe('hello');
    });

    test('handle arraybuffer response', async () => {
      const buffer = new ArrayBuffer(42);
      nock(baseUrl).get('/').reply(200, buffer);
      const response = await client.get<string>('/', {
        responseType: HttpResponseType.ArrayBuffer,
      });
      expect(response.data).toEqual(buffer);
    });

    test('handle json errors and fallback to text response', async () => {
      nock(baseUrl).get('/').reply(200, '');
      const response = await client.get('/');
      expect(response.data).toEqual('');
    });

    test('handle query params', async () => {
      nock(baseUrl).get('/').query({ assetId: 123 }).reply(200, {});
      await client.get('/', { params: { assetId: 123 } });
    });

    test('custom headers', async () => {
      nock(baseUrl, { reqheaders: { [header.name]: header.value } })
        .get('/')
        .reply(200, {});
      await client.get('/', { headers: { [header.name]: header.value } });
    });

    test('override headers', async () => {
      client.setDefaultHeader(header.name, 'another-value');
      nock(baseUrl, { reqheaders: { [header.name]: header.value } })
        .get('/')
        .reply(200, {});
      await client.get('/', { headers: { [header.name]: header.value } });
    });

    test('override base url in a single request', async () => {
      nock('https://another-domain').get('/abc').reply(200, {});
      await client.get('https://another-domain/abc');
    });

    test('throw on error status code', async () => {
      nock(baseUrl)
        .get('/')
        .reply(500, {
          error: { code: 500, message: 'Internal server error' },
        });
      await expect(client.get('/')).rejects.toThrowErrorMatchingInlineSnapshot(
        '[Error: Request failed | status code: 500]'
      );
    });

    test('expose status code in throwed error', async () => {
      nock(baseUrl).get('/').reply(500, {});
      expect.assertions(1);
      try {
        await client.get('/');
      } catch (err) {
        if (!(err instanceof HttpError)) {
          throw err;
        }
        expect(err.status).toBe(500);
      }
    });

    test('expose headers in throwed error', async () => {
      nock(baseUrl)
        .get('/')
        .reply(500, {}, { [header.name]: header.value });
      expect.assertions(1);
      try {
        await client.get('/');
      } catch (err) {
        if (!(err instanceof HttpError)) {
          throw err;
        }
        expect(err.headers[header.name]).toBe(header.value);
      }
    });

    test('expose body in throwed error', async () => {
      nock(baseUrl).get('/').reply(500, { a: 42 });
      expect.assertions(1);
      try {
        await client.get('/');
      } catch (err) {
        if (!(err instanceof HttpError)) {
          throw err;
        }
        expect(err.data).toEqual({ a: 42 });
      }
    });

    test('throw on request error', async () => {
      nock(baseUrl).get('/').replyWithError('Unknown error');
      await expect(client.get('/')).rejects.toThrowError();
    });
  });

  describe('post', () => {
    test('send request body', async () => {
      nock(baseUrl).post('/', { a: 42 }).reply(200, {});
      await client.post('/', { data: { a: 42 } });
    });

    test('set correct content-type for json', async () => {
      nock(baseUrl, { reqheaders: { 'content-type': 'application/json' } })
        .post('/', {})
        .reply(200, {});
      await client.post('/', { data: {} });
    });
  });

  describe('baseUrl', () => {
    test('should handle baseUrl with path', async () => {
      const customClient = new BasicHttpClient('https://example.com/some/path');
      nock('https://example.com/some/path').get('/abc').reply(200, {});
      await customClient.get('/abc');
    });
  });

  describe('dedupable requests', () => {
    test('should coalesce identical in-flight GET requests', async () => {
      const scope = nock(baseUrl).get('/resource').reply(200, { id: 1 });
      const [r1, r2] = await Promise.all([
        client.get('/resource', { dedupable: true }),
        client.get('/resource', { dedupable: true }),
      ]);
      expect(r1.data).toEqual({ id: 1 });
      expect(r2.data).toEqual({ id: 1 });
      // nock set up only one reply — if two fetches fired, the second would fail
      expect(scope.isDone()).toBe(true);
    });

    test('should coalesce identical in-flight POST requests', async () => {
      const scope = nock(baseUrl)
        .post('/list', { limit: 10 })
        .reply(200, { items: [] });
      const opts = { data: { limit: 10 }, dedupable: true } as const;
      const [r1, r2] = await Promise.all([
        client.post('/list', opts),
        client.post('/list', opts),
      ]);
      expect(r1.data).toEqual({ items: [] });
      expect(r2.data).toEqual({ items: [] });
      expect(scope.isDone()).toBe(true);
    });

    test('should not coalesce requests with different bodies', async () => {
      nock(baseUrl).post('/list', { limit: 10 }).reply(200, { items: [1] });
      nock(baseUrl).post('/list', { limit: 20 }).reply(200, { items: [2] });
      const [r1, r2] = await Promise.all([
        client.post('/list', { data: { limit: 10 }, dedupable: true }),
        client.post('/list', { data: { limit: 20 }, dedupable: true }),
      ]);
      expect(r1.data).toEqual({ items: [1] });
      expect(r2.data).toEqual({ items: [2] });
    });

    test('should not dedup when dedupable is not set', async () => {
      nock(baseUrl).get('/resource').reply(200, { call: 1 });
      nock(baseUrl).get('/resource').reply(200, { call: 2 });
      const [r1, r2] = await Promise.all([
        client.get('/resource'),
        client.get('/resource'),
      ]);
      expect(r1.data).toEqual({ call: 1 });
      expect(r2.data).toEqual({ call: 2 });
    });

    test('should remove entry from cache after resolution', async () => {
      nock(baseUrl).get('/resource').reply(200, { first: true });
      await client.get('/resource', { dedupable: true });
      // Second request after the first completes should make a new fetch
      nock(baseUrl).get('/resource').reply(200, { second: true });
      const r2 = await client.get('/resource', { dedupable: true });
      expect(r2.data).toEqual({ second: true });
    });

    test('should remove entry from cache after rejection', async () => {
      nock(baseUrl).get('/fail').reply(500, { error: 'fail' });
      await expect(
        client.get('/fail', { dedupable: true })
      ).rejects.toThrow();
      // After failure, next request should go through
      nock(baseUrl).get('/fail').reply(200, { ok: true });
      const r = await client.get('/fail', { dedupable: true });
      expect(r.data).toEqual({ ok: true });
    });
  });

  describe('resolveUrl', () => {
    test('should remove path trailing slashes', async () => {
      // @ts-ignore
      const path = BasicHttpClient.resolveUrl('', '/test///');
      expect(path).toEqual('/test');
    });
    test('should add uri slash prefix', async () => {
      // @ts-ignore
      const path = BasicHttpClient.resolveUrl('', 'test');
      expect(path).toEqual('/test');
    });
    test('should support multiple segments', async () => {
      // @ts-ignore
      const path = BasicHttpClient.resolveUrl('', 'test/te/st///');
      expect(path).toEqual('/test/te/st');
    });
    test('should do nothing with valid uri', async () => {
      // @ts-ignore
      const path = BasicHttpClient.resolveUrl('', '/test');
      expect(path).toEqual('/test');
    });
  });
});
