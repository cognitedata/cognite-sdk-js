// Copyright 2018 Cognite AS

import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { apiUrl, BASE_URL, projectUrl, setBearerToken } from '../core';
import { configure, instance, rawGet, rawPost } from '../index';

// testing a lot of retry requests with exponential-backoff
jest.setTimeout(10000);

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

  test('handling error messages with request id', async done => {
    const errorCode = 418;
    const errorMessage = 'Custom error message';
    const xRequestId = 'my-request-id';
    mock.onGet(/\/error$/).reply(
      errorCode,
      {
        error: {
          code: errorCode,
          message: errorMessage,
        },
      },
      { 'X-Request-Id': xRequestId }
    );

    const exceptionMessage = `${errorMessage} | code: ${errorCode} | X-Request-ID: ${xRequestId}`;

    try {
      await rawGet('/error');
    } catch (error) {
      await expect(rawGet('/error')).rejects.toThrowError(exceptionMessage);
      expect(error.message).toBe(exceptionMessage);
      expect(error.status).toBe(errorCode);
      expect(error.requestId).toBe(xRequestId);
      done();
    }
  });

  test('handling error messages without request id', async done => {
    const errorCode = 418;
    const errorMessage = 'Custom error message';
    mock.onGet(/\/error$/).reply(errorCode, {
      error: {
        code: errorCode,
        message: errorMessage,
      },
    });

    const exceptionMessage = `${errorMessage} | code: ${errorCode}`;

    try {
      await rawGet('/error');
    } catch (error) {
      await expect(rawGet('/error')).rejects.toThrowError(exceptionMessage);
      expect(error.message).toBe(exceptionMessage);
      expect(error.status).toBe(errorCode);
      expect(error.requestId).toBeUndefined();
      done();
    }
  });

  test('retry requests', async () => {
    const { raxConfig } = instance.defaults as any;
    expect(raxConfig.numRetries).toBeGreaterThan(1);
    const responseMock = jest.fn();
    responseMock.mockImplementation(_ => {
      return [500, {}];
    });
    mock.onGet(/\/retry$/).reply((config: any) => {
      return responseMock(config);
    });
    await expect(rawGet('/retry')).rejects.toThrowError(
      'Request failed with status code 500'
    );
    expect(responseMock).toHaveBeenCalledTimes(raxConfig.numRetries + 1);
  });

  test('retry requests and end with success', async () => {
    const responseMock = jest.fn();
    responseMock.mockImplementationOnce(_ => {
      return [500, {}];
    });
    responseMock.mockImplementationOnce(_ => {
      return [200, {}];
    });
    mock.onGet(/\/retry$/).reply((config: any) => {
      return responseMock(config);
    });
    const response = (await rawGet('/retry')) as AxiosResponse;
    expect(responseMock).toHaveBeenCalledTimes(2);
    expect(response.data).toEqual({});
  });

  test('dont retry post', async () => {
    const responseMock = jest.fn();
    responseMock.mockImplementation(_ => {
      return [500, {}];
    });
    mock.onPost(/\/retry$/).reply((config: any) => {
      return responseMock(config);
    });
    await expect(rawPost('/retry')).rejects.toThrowError(
      'Request failed with status code 500'
    );
    expect(responseMock).toHaveBeenCalledTimes(1);
  });

  test('dont retry all status codes', async () => {
    const responseMock = jest.fn();
    responseMock.mockImplementation(_ => {
      return [200, {}];
    });
    mock.onPost(/\/retry$/).reply((config: any) => {
      return responseMock(config);
    });
    const response = (await rawPost('/retry')) as AxiosResponse;
    expect(response.data).toEqual({});
    expect(responseMock).toHaveBeenCalledTimes(1);
  });

  test('network error', async () => {
    mock.onPost(/\/retry$/).networkError();
    await expect(rawPost('/retry')).rejects.toThrowErrorMatchingInlineSnapshot(
      `"Network Error"`
    );
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

  test('header leakage', async () => {
    const DONE = 'Done';
    configure({
      apiKey: 'abc',
    });
    setBearerToken('abc');
    const axiosGlobalMock = new MockAdapter(axios);
    axiosGlobalMock.onGet(/\/test$/).reply((config: AxiosRequestConfig) => {
      expect(config.headers.Authorization).toBeUndefined();
      expect(config.headers['api-key']).toBeUndefined();
      return [200, DONE];
    });
    const response = await axios({
      url: '/test',
      method: 'GET',
    });
    expect(response.data).toBe(DONE);
    axiosGlobalMock.restore();
  });

  describe('token leakage', () => {
    const token = 'abc';
    const nonPresentTokenChecker = (config: AxiosRequestConfig) => {
      if (config.headers.Authorization !== undefined) {
        return [400];
      }
      return [200];
    };

    const presentTokenChecker = (config: AxiosRequestConfig) => {
      if (config.headers.Authorization !== `Bearer ${token}`) {
        return [400];
      }
      return [200];
    };

    test('raw request', async () => {
      configure({
        baseUrl: 'https://api.cognitedata.com',
      });
      setBearerToken(token);

      // [url, shouldTokenPresent, mockUrl?]
      const tests: [string, boolean, string?][] = [
        ['http://localhost:8888', false],
        ['https://another-company.com', false],
        ['http/path', true],
        ['//example.com/path', false],
        [
          'https://api.cognitedata.com.my-evil-domain.com/path',
          false,
          '.my-evil-domain.com/path',
        ],
        ['https://api.cognitedata-com.com/path', false],
        ['https://my-evil.domain.com/cognitedata.com/path', false],
        ['ftp://my-evil-domain.com', false],
        ['/test', true],
      ];

      const promises: Promise<any>[] = [];
      tests.forEach(([url, shouldTokenPresent, mockUrl]) => {
        const tester = shouldTokenPresent
          ? presentTokenChecker
          : nonPresentTokenChecker;
        mock.onGet(mockUrl ? mockUrl : url).reply(tester);
        promises.push(rawGet(url));
      });

      await Promise.all(promises);
    });

    test('other base url', async () => {
      configure({
        baseUrl: 'https://another-base-url.com',
      });
      setBearerToken(token);
      mock.onGet('https://another-base-url.com/abc').reply(presentTokenChecker);
      await rawGet('https://another-base-url.com/abc');

      mock.onGet('/test').reply(presentTokenChecker);
      await rawGet('/test');
    });
  });
});
