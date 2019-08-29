// Copyright 2019 Cognite AS
import { RetryableHttpClient } from '@/utils/http/retryableHttpClient';
import * as nock from 'nock';

describe('RetryableHttpClient', () => {
  const baseUrl = 'https://example.com';
  let client: RetryableHttpClient;
  beforeEach(() => {
    client = new RetryableHttpClient(
      baseUrl,
      (_, response) => response.status === 500
    );
  });

  beforeAll(() => {
    nock.disableNetConnect();
  });

  test('should retry', async () => {
    const scope = nock(baseUrl)
      .get('/')
      .times(2)
      .reply(500, {});
    nock(baseUrl)
      .get('/')
      .reply(200, { a: 42 });
    const res = await client.get('/');
    expect(scope.isDone()).toBeTruthy();
    expect(res.status).toBe(200);
    expect(res.data).toEqual({ a: 42 });
  });

  test("shouldn't retry", async () => {
    nock(baseUrl)
      .get('/')
      .reply(200, { a: 42 });
    const res = await client.get('/');
    expect(res.status).toBe(200);
    expect(res.data).toEqual({ a: 42 });
  });

  test('throw on 400 after retry', async () => {
    expect.assertions(1);
    nock(baseUrl)
      .get('/')
      .times(2)
      .reply(500, {});
    nock(baseUrl)
      .get('/')
      .reply(400, { a: 42 });
    try {
      await client.get('/');
    } catch (err) {
      expect(err.message).toMatchInlineSnapshot(
        `"Request failed | status code: 400"`
      );
    }
  });
});
