// Copyright 2018 Cognite AS

import { AxiosRequestConfig } from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { apiUrl, BASE_URL, projectUrl, setBearerToken } from '../core';
import { configure, instance, rawGet } from '../index';

let mock: MockAdapter;

beforeAll(() => {
  mock = new MockAdapter(instance);
});

afterAll(() => {
  mock.restore();
});

afterEach(() => {
  // cleaning up the mess left behind the previous test
  mock.reset();
});

describe('Core', () => {
  test('test configure', async () => {
    const project = 'test-project';
    const apiKey = 'test-api-key';
    configure({
      project,
      apiKey,
      withCredentials: true,
    });
    mock.onGet(/\/test$/).reply((config: AxiosRequestConfig) => {
      if (config.baseURL !== BASE_URL) {
        return [404];
      }
      if (config.headers['api-key'] !== apiKey) {
        return [404];
      }
      if (config.method !== 'get') {
        return [404];
      }
      if (config.withCredentials !== true) {
        return [404];
      }
      return [200];
    });
    await rawGet('/test');
    mock.reset();

    const newBaseUrl = 'https://greenfield.cognitedata.com';
    configure({
      baseUrl: newBaseUrl,
      withCredentials: false,
    });
    mock
      .onGet(/\/test\/abc$/, { params: { enabled: true } })
      .reply((config: AxiosRequestConfig) => {
        if (config.baseURL !== newBaseUrl) {
          return [404];
        }
        if (config.headers['api-key'] !== apiKey) {
          return [404];
        }
        if (config.method !== 'get') {
          return [404];
        }
        if (config.withCredentials !== false) {
          return [404];
        }
        if (config.params.enabled !== true) {
          return [404];
        }
        return [200];
      });
    await rawGet('test/abc', { params: { enabled: true } });
    mock.reset();

    const reg = new RegExp(
      `api/0.6/projects/${encodeURIComponent(project)}/test-url$`
    );
    mock.onGet(reg).reply(200);
    await rawGet(`${apiUrl(0.6)}/${projectUrl()}/test-url`);
  });

  test('handling error messages', async () => {
    const errorCode = 418;
    const errorMessage = 'Custom error message';
    mock.onGet(/\/error$/).reply(errorCode, {
      error: {
        code: errorCode,
        message: errorMessage,
      },
    });

    await expect(rawGet('/error')).rejects.toThrow();
    try {
      await rawGet('/error');
      expect(false).toBe(true); // dummy test
    } catch (error) {
      expect(error.message).toBe(errorMessage);
      expect(error.status).toBe(errorCode);
    }
  });

  test('test setBearerToken', async () => {
    const token = 'test-token';
    setBearerToken(token);
    mock.onGet(/\/test$/).reply((config: AxiosRequestConfig) => {
      if (config.headers.Authorization !== `Bearer ${token}`) {
        return [404];
      }
      return [200];
    });
    await rawGet('/test');
  });
});
