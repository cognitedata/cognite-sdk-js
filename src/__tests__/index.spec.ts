// Copyright 2019 Cognite AS

import MockAdapter from 'axios-mock-adapter';
import { generateAxiosInstance } from '../axiosWrappers';
import {
  createClientWithApiKey,
  createClientWithOAuth,
  getApiKeyInfo,
  POPUP,
  REDIRECT,
} from '../index';
import * as Login from '../resources/login';
import { sleepPromise } from '../utils';
import {
  apiKey,
  authTokens,
  baseUrl,
  loggedInResponse,
  project,
} from './testUtils';

describe('createClientWithApiKey', () => {
  test('missing parameter', async () => {
    expect(
      // @ts-ignore
      () => createClientWithApiKey()
    ).toThrowErrorMatchingInlineSnapshot(
      `"\`createClientWithApiKey\` is missing parameter \`options\`"`
    );
  });

  test('missing project', async () => {
    expect(
      // @ts-ignore
      () => createClientWithApiKey({})
    ).toThrowErrorMatchingInlineSnapshot(
      `"Property \`project\` not provided to param \`options\` in \`createClientWithApiKey\`"`
    );
  });

  test('missing api key', async () => {
    expect(
      // @ts-ignore
      () => createClientWithApiKey({ project })
    ).toThrowErrorMatchingInlineSnapshot(
      `"Property \`apiKey\` not provided to param \`options\` in \`createClientWithApiKey\`"`
    );
  });

  test('create client with invalid api-key/project', async () => {
    const client = createClientWithApiKey({
      project,
      apiKey,
    });
    expect(client).toBeTruthy();
  });

  test('set correct apikey', async () => {
    expect.assertions(1);
    const axiosInstance = generateAxiosInstance(baseUrl);
    const client = createClientWithApiKey({
      project,
      apiKey,
      _axiosInstance: axiosInstance,
    });
    const axiosMock = new MockAdapter(axiosInstance);
    axiosMock.onGet('/test').replyOnce(config => {
      expect(config.headers['api-key']).toBe(apiKey);
      return [200];
    });
    await client.get('/test');
  });

  test('set correct project', async () => {
    const client = createClientWithApiKey({
      project,
      apiKey,
    });
    expect(client.project).toBe(project);
  });
});

describe('createClientWithOAuth', () => {
  test('missing parameter', async () => {
    expect(
      // @ts-ignore
      () => createClientWithOAuth()
    ).toThrowErrorMatchingInlineSnapshot(
      `"\`createClientWithOAuth\` is missing parameter \`options\`"`
    );
  });

  test('missing project name', async () => {
    expect(
      // @ts-ignore
      () => createClientWithOAuth({})
    ).toThrowErrorMatchingInlineSnapshot(
      `"Property \`project\` not provided to param \`options\` in \`createClientWithOAuth\`"`
    );
  });

  describe('authentication', () => {
    let mockLoginSilently: jest.SpyInstance;
    let mockRedirect: jest.SpyInstance;
    let mockPopup: jest.SpyInstance;

    beforeEach(() => {
      mockLoginSilently = jest.spyOn(Login, 'loginSilently');
      mockLoginSilently.mockImplementation(() => {});

      mockRedirect = jest.spyOn(Login, 'loginWithRedirect');
      mockRedirect.mockImplementation(async () => {});

      mockPopup = jest.spyOn(Login, 'loginWithPopup');
      mockPopup.mockImplementation(async () => {});
    });

    afterEach(() => {
      mockLoginSilently.mockRestore();
      mockRedirect.mockRestore();
    });

    test('default onAuthenticate function should be redirect', async done => {
      const client = createClientWithOAuth({ project });
      mockRedirect.mockImplementationOnce(async () => {
        done();
      });
      client.authenticate();
    });

    test('onAuthenticate: REDIRECT', async done => {
      const client = createClientWithOAuth({
        project,
        onAuthenticate: REDIRECT,
      });
      mockRedirect.mockImplementationOnce(async () => {
        done();
      });
      await client.authenticate();
    });

    test('onAuthenticate: POPUP', async done => {
      const client = createClientWithOAuth({
        project,
        onAuthenticate: POPUP,
      });
      mockPopup.mockImplementationOnce(async () => {
        done();
        return {};
      });
      await client.authenticate();
    });

    test('should call onAuthenticate on 401', async () => {
      const axiosInstance = generateAxiosInstance(baseUrl);
      const axiosMock = new MockAdapter(axiosInstance);
      const onAuthenticate = jest.fn();
      const client = createClientWithOAuth({
        project,
        onAuthenticate,
        _axiosInstance: axiosInstance,
      });
      onAuthenticate.mockImplementation(login => {
        login.skip();
      });
      axiosMock.onGet('/401').replyOnce(401);
      await expect(
        client.get('/401')
      ).rejects.toThrowErrorMatchingInlineSnapshot(
        `"Request failed with status code 401"`
      );
      expect(mockLoginSilently).toHaveBeenCalledTimes(1);
    });

    test('manually trigger authentication', async () => {
      const onAuthenticate = jest.fn().mockImplementationOnce(login => {
        login.skip();
      });
      const client = createClientWithOAuth({
        project,
        onAuthenticate,
      });
      await expect(client.authenticate()).resolves.toBe(false);
      expect(mockLoginSilently).toHaveBeenCalledTimes(1);
    });

    test('handle error query params', async () => {
      const onAuthenticate = jest.fn();
      const client = createClientWithOAuth({
        project,
        onAuthenticate,
      });
      const errorMessage = 'Failed login';
      mockLoginSilently.mockImplementationOnce(() => {
        throw Error(errorMessage);
      });
      await expect(client.authenticate()).rejects.toThrowError(errorMessage);
    });

    test('retry request after silent login', async () => {
      const axiosInstance = generateAxiosInstance(baseUrl);
      const axiosMock = new MockAdapter(axiosInstance);
      const onAuthenticate = jest.fn();
      const client = createClientWithOAuth({
        project,
        onAuthenticate,
        _axiosInstance: axiosInstance,
      });
      mockLoginSilently.mockReturnValueOnce(authTokens);
      expect.assertions(3);
      axiosMock.onGet('/').replyOnce(config => {
        expect(config.headers.Authorization).not.toBeDefined();
        return [401];
      });
      const body = 'hello';
      axiosMock.onGet('/').replyOnce(config => {
        expect(config.headers.Authorization).toBe(
          `Bearer ${authTokens.accessToken}`
        );
        return [200, body];
      });
      const response = await client.get('/');
      expect(response.data).toBe(body);
    });

    test('dont call onAuthenticate twice when first call hasnt returned yet', async () => {
      const axiosInstance = generateAxiosInstance(baseUrl);
      const axiosMock = new MockAdapter(axiosInstance);
      const onAuthenticate = jest.fn().mockImplementationOnce(async login => {
        await sleepPromise(100);
        login.skip();
      });
      const client = createClientWithOAuth({
        project,
        onAuthenticate,
        _axiosInstance: axiosInstance,
      });
      axiosMock.onGet('/401').replyOnce(401);
      let promise401Throwed = false;
      client.get('/401').catch(() => {
        promise401Throwed = true;
      });
      const promiseAuthenticate = client.authenticate();
      await sleepPromise(200);
      expect(onAuthenticate).toBeCalledTimes(1);
      expect(promise401Throwed).toBe(true);
      await expect(promiseAuthenticate).resolves.toBe(false);
    });

    test(
      'handle 401 from /login/status when authenticating',
      async () => {
        const axiosInstance = generateAxiosInstance(baseUrl);
        const axiosMock = new MockAdapter(axiosInstance);
        const onAuthenticate = jest.fn();
        const client = createClientWithOAuth({
          project,
          onAuthenticate,
          _axiosInstance: axiosInstance,
        });
        expect.assertions(1);
        mockLoginSilently.mockImplementationOnce(async () => {
          await expect(
            Login.getIdInfoFromAccessToken(
              axiosInstance,
              authTokens.accessToken
            )
          ).resolves.toBeNull();
          return authTokens;
        });
        axiosMock.onGet('/').replyOnce(401);
        axiosMock
          .onGet('/login/status')
          .replyOnce(401, { error: { code: 401, message: 'Unauthorized' } });
        axiosMock.onGet('/').reply(200);
        await client.get('/');
      },
      500
    );
  });
});

describe('getApiKeyInfo', () => {
  test('valid apikey', async () => {
    const axiosInstance = generateAxiosInstance(baseUrl);
    const axiosMock = new MockAdapter(axiosInstance);
    axiosMock.onGet(`${baseUrl}/login/status`).replyOnce(200, loggedInResponse);
    await expect(
      getApiKeyInfo(apiKey, baseUrl, axiosInstance)
    ).resolves.toEqual({
      project: loggedInResponse.data.project,
      user: loggedInResponse.data.user,
    });
  });

  test('invalid api-key', async () => {
    const axiosInstance = generateAxiosInstance(baseUrl);
    const axiosMock = new MockAdapter(axiosInstance);
    axiosMock.onGet(`${baseUrl}/login/status`).replyOnce(401, { error: {} });
    await expect(
      getApiKeyInfo(apiKey, baseUrl, axiosInstance)
    ).resolves.toBeNull();
  });

  test('logged out api-key', async () => {
    const axiosInstance = generateAxiosInstance(baseUrl);
    const axiosMock = new MockAdapter(axiosInstance);
    axiosMock
      .onGet(`${baseUrl}/login/status`)
      .replyOnce(200, { data: { loggedIn: false } });
    await expect(
      getApiKeyInfo(apiKey, baseUrl, axiosInstance)
    ).resolves.toBeNull();
  });
});
