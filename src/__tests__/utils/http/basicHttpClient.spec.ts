// Copyright 2019 Cognite AS
import * as nock from 'nock';
import {
  BasicHttpClient,
  HttpResponseType,
} from '../../../utils/http/basicHttpClient';

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
    });

    test('override default header', async () => {
      client.setDefaultHeader(header.name, 'another-value');
      client.setDefaultHeader(header.name, header.value);
      nock(baseUrl, { reqheaders: { [header.name]: header.value } })
        .post('/')
        .reply(200, {});
      await client.post('/');
    });
  });

  describe('get', () => {
    test('use correct base url', async () => {
      nock(baseUrl)
        .get('/')
        .reply(200, {});
      await client.get('');
    });

    test('use correct path', async () => {
      const path = '/abc/def';
      nock(baseUrl)
        .get(path)
        .reply(200, {});
      await client.get(path);
    });

    test('handle json response', async () => {
      nock(baseUrl)
        .get('/')
        .reply(200, { a: 42 });
      const response = await client.get<any>('/');
      expect(response.data).toEqual({ a: 42 });
    });

    test('handle text response', async () => {
      nock(baseUrl)
        .get('/')
        .reply(200, 'hello');
      const response = await client.get<string>('/', {
        responseType: HttpResponseType.Text,
      });
      expect(response.data).toBe('hello');
    });

    test('handle arraybuffer response', async () => {
      const buffer = new ArrayBuffer(42);
      nock(baseUrl)
        .get('/')
        .reply(200, buffer);
      const response = await client.get<string>('/', {
        responseType: HttpResponseType.ArrayBuffer,
      });
      expect(response.data).toEqual(buffer);
    });

    test('handle query params', async () => {
      nock(baseUrl)
        .get('/')
        .query({ assetId: 123 })
        .reply(200, {});
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
      nock('https://another-domain')
        .get('/abc')
        .reply(200, {});
      await client.get('https://another-domain/abc');
    });

    test('throw on error status code', async () => {
      nock(baseUrl)
        .get('/')
        .reply(500, {
          error: { code: 500, message: 'Internal server error' },
        });
      await expect(client.get('/')).rejects.toThrowErrorMatchingInlineSnapshot(
        `"Request failed | status code: 500"`
      );
    });

    test('expose status code in throwed error', async () => {
      nock(baseUrl)
        .get('/')
        .reply(500, {});
      expect.assertions(1);
      try {
        await client.get('/');
      } catch (err) {
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
        expect(err.headers[header.name]).toBe(header.value);
      }
    });

    test('expose body in throwed error', async () => {
      nock(baseUrl)
        .get('/')
        .reply(500, { a: 42 });
      expect.assertions(1);
      try {
        await client.get('/');
      } catch (err) {
        expect(err.data).toEqual({ a: 42 });
      }
    });

    test('throw on request error', async () => {
      nock(baseUrl)
        .get('/')
        .replyWithError('Unknown error');
      await expect(client.get('/')).rejects.toThrowError();
    });
  });

  describe('post', () => {
    test('send request body', async () => {
      nock(baseUrl)
        .post('/', { a: 42 })
        .reply(200, {});
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
      nock('https://example.com/some/path')
        .get('/abc')
        .reply(200, {});
      await customClient.get('/abc');
    });
  });
});
