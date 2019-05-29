// Copyright 2019 Cognite AS

import { AxiosInstance, AxiosRequestConfig } from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { generateAxiosInstance, rawRequest } from '../axiosWrappers';
import { BASE_URL } from '../constants';
import { createErrorReponse } from './testUtils';

describe('axiosWrappers', () => {
  const responseMock = jest.fn();
  let instance: AxiosInstance;
  let mock: MockAdapter;
  const url = '/path';

  beforeEach(() => {
    instance = generateAxiosInstance(BASE_URL);
    mock = new MockAdapter(instance);
    responseMock.mockReset();
    mock.onAny(url).reply((config: any) => responseMock(config));
  });

  describe('rawGet', () => {
    test('simple', async () => {
      const body = { data: {} };
      responseMock.mockReturnValueOnce([200, body]);
      const response = await rawRequest(instance, { method: 'get', url });
      expect(response.data).toEqual(body);
      expect(responseMock).toHaveBeenCalledTimes(1);
      const config = responseMock.mock.calls[0][0] as AxiosRequestConfig;
      expect(config.method).toBe('get');
      expect(config.url).toBe(url);
    });

    test('with query params', async () => {
      responseMock.mockReturnValueOnce([200, {}]);
      const params = {
        name: 'cdp',
        limit: 10,
      };
      await rawRequest(instance, { method: 'get', url, params });
      const config = responseMock.mock.calls[0][0] as AxiosRequestConfig;
      expect(config.params).toEqual(params);
    });
  });

  describe('transform date', () => {
    test('transform date in body', async done => {
      const now = new Date();
      responseMock.mockImplementationOnce(config => {
        const { myDate } = JSON.parse(config.data);
        expect(myDate).toBe(now.getTime());
        done();
        return [200];
      });
      await rawRequest(instance, {
        method: 'get',
        url,
        data: { myDate: now },
      });
    });

    test('transform date in query params', async done => {
      const now = new Date();
      responseMock.mockImplementationOnce(config => {
        const { minLastUpdatedTime } = config.params;
        expect(minLastUpdatedTime).toBe(now.getTime());
        done();
        return [200];
      });
      await rawRequest(instance, {
        method: 'get',
        url,
        params: { minLastUpdatedTime: now },
      });
    });
  });

  describe('x-cdp headers', () => {
    test('x-cdp-sdk', async () => {
      responseMock.mockReturnValueOnce([200, {}]);
      await rawRequest(instance, { method: 'get', url });
      expect(responseMock).toHaveBeenCalledTimes(1);
      const config = responseMock.mock.calls[0][0] as AxiosRequestConfig;
      expect(config.headers['x-cdp-sdk']).toBeDefined();
      expect(config.headers['x-cdp-sdk']).toMatch(/^CogniteJavaScriptSDK:.+$/);
    });

    test('x-cdp-app', async () => {
      const appId = 'my-app';
      const axiosInstance = generateAxiosInstance(BASE_URL, appId);
      const axiosMock = new MockAdapter(axiosInstance);
      axiosMock
        .onAny(url)
        .reply((requestConfig: any) => responseMock(requestConfig));
      responseMock.mockReturnValueOnce([200, {}]);
      await rawRequest(axiosInstance, { method: 'get', url });
      expect(responseMock).toHaveBeenCalledTimes(1);
      const config = responseMock.mock.calls[0][0] as AxiosRequestConfig;
      expect(config.headers['x-cdp-app']).toBe(appId);
    });
  });

  describe('exceptions', () => {
    test('axiosError', async () => {
      const status = 500;
      responseMock.mockReturnValueOnce([status, {}]);
      await expect(
        rawRequest(instance, { method: 'get', url: '/path' })
      ).rejects.toThrowErrorMatchingInlineSnapshot(
        `"Request failed with status code 500"`
      );
    });

    test('cogniteError', async done => {
      const status = 500;
      responseMock.mockReturnValueOnce([
        status,
        {
          error: {
            message: 'abc',
            code: status,
          },
        },
      ]);
      try {
        await rawRequest(instance, { method: 'get', url: '/path' });
      } catch (err) {
        expect(err.status).toBe(status);
        expect(err.requestId).toBeUndefined();
        expect(() => {
          throw err;
        }).toThrowErrorMatchingInlineSnapshot(`"abc | code: 500"`);
        done();
      }
    });

    test('cogniteError with requestId', async done => {
      const status = 500;
      const requestId = 'def';
      responseMock.mockReturnValueOnce([
        status,
        createErrorReponse(500, 'abc'),
        { 'X-Request-Id': requestId },
      ]);
      try {
        await rawRequest(instance, { method: 'get', url: '/path' });
      } catch (err) {
        expect(err.status).toBe(status);
        expect(err.requestId).toBe(requestId);
        expect(() => {
          throw err;
        }).toThrowErrorMatchingInlineSnapshot(
          `"abc | code: 500 | X-Request-ID: def"`
        );
        done();
      }
    });
  });
});
