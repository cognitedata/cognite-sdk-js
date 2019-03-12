// Copyright 2019 Cognite AS

import MockAdapter from 'axios-mock-adapter';
import { generateAxiosInstance } from '../axiosWrappers';
import { CDP } from '../cdp';
import { getIdInfoFromAccessToken, loginSilently } from '../resources/login';
import { createErrorReponse } from './testUtils';

jest.mock('../resources/login', () => {
  return {
    ...require.requireActual('../resources/login'),
    loginSilently: jest.fn(),
  };
});

describe('CDP', () => {
  const apiKey = 'TEST_KEY';
  const project = 'TEST_PROJECT';
  const loginInfo = {
    loggedIn: true,
    user: 'user@example.com',
    project,
    projectId: 123,
  };
  const baseUrl = 'https://example.com';
  const authTokens = {
    accessToken: 'abc',
    idToken: 'def',
  };

  describe('createClientWithApiKey', async () => {
    test('missing parameter', async () => {
      await expect(
        // @ts-ignore
        CDP.createClientWithApiKey()
      ).rejects.toThrowErrorMatchingInlineSnapshot(
        `"\`createClientWithApiKey\` is missing parameter \`options\`"`
      );
    });

    test('missing project', async () => {
      await expect(
        // @ts-ignore
        CDP.createClientWithApiKey({})
      ).rejects.toThrowErrorMatchingInlineSnapshot(
        `"Property \`project\` not provided to param \`options\` in \`createClientWithApiKey\`"`
      );
    });

    test('missing api key', async () => {
      await expect(
        // @ts-ignore
        CDP.createClientWithApiKey({ project })
      ).rejects.toThrowErrorMatchingInlineSnapshot(
        `"Property \`apiKey\` not provided to param \`options\` in \`createClientWithApiKey\`"`
      );
    });

    test('invalid api key', async () => {
      const axiosInstance = generateAxiosInstance(baseUrl);
      const axiosMock = new MockAdapter(axiosInstance);
      axiosMock.onGet(`${baseUrl}/login/status`).replyOnce(config => {
        expect(config.headers['api-key']).toBe(apiKey);
        return [401, createErrorReponse(401, '')];
      });
      await expect(
        CDP.createClientWithApiKey({
          project,
          apiKey,
          _axiosInstance: axiosInstance,
        })
      ).rejects.toThrowErrorMatchingInlineSnapshot(
        `"The api key provided to \`createClientWithApiKey\` is not recognized by CDP (invalid)"`
      );
    });

    test('project mismatch', async () => {
      const axiosInstance = generateAxiosInstance(baseUrl);
      const axiosMock = new MockAdapter(axiosInstance);
      axiosMock.onGet(`${baseUrl}/login/status`).replyOnce(config => {
        expect(config.headers['api-key']).toBe(apiKey);
        return [200, { data: loginInfo }];
      });
      await expect(
        CDP.createClientWithApiKey({
          apiKey,
          project: 'another-project',
          _axiosInstance: axiosInstance,
        })
      ).rejects.toThrowErrorMatchingInlineSnapshot(
        `"Projects didn't match. Api key is for project \\"TEST_PROJECT\\" but you tried to login to \\"another-project\\""`
      );
    });

    test('set correct project', async () => {
      const axiosInstance = generateAxiosInstance(baseUrl);
      const axiosMock = new MockAdapter(axiosInstance);
      axiosMock
        .onGet(`${baseUrl}/login/status`)
        .replyOnce(200, { data: loginInfo });
      const cdp = await CDP.createClientWithApiKey({
        project,
        apiKey,
        _axiosInstance: axiosInstance,
      });
      expect(cdp.project).toBe(loginInfo.project);
    });
  });

  describe('createClientWithOAuth', async () => {
    test('missing parameter', async () => {
      await expect(
        // @ts-ignore
        CDP.createClientWithOAuth()
      ).rejects.toThrowErrorMatchingInlineSnapshot(
        `"\`createClientWithOAuth\` is missing parameter \`options\`"`
      );
    });

    test('missing project name', async () => {
      await expect(
        // @ts-ignore
        CDP.createClientWithOAuth({})
      ).rejects.toThrowErrorMatchingInlineSnapshot(
        `"Property \`project\` not provided to param \`options\` in \`createClientWithOAuth\`"`
      );
    });

    describe('authentication', () => {
      const mockLoginSilently = loginSilently as jest.Mock;
      beforeEach(() => {
        mockLoginSilently.mockReset();
      });

      test('should call onAuthenticate on 401', async () => {
        const axiosInstance = generateAxiosInstance(baseUrl);
        const axiosMock = new MockAdapter(axiosInstance);
        const onAuthenticate = jest.fn();
        const cdp = await CDP.createClientWithOAuth({
          project,
          onAuthenticate,
          _axiosInstance: axiosInstance,
        });
        onAuthenticate.mockImplementation(login => {
          login.skip();
        });
        axiosMock.onGet('/401').replyOnce(401);
        await expect(
          cdp.get('/401')
        ).rejects.toThrowErrorMatchingInlineSnapshot(
          `"Request failed with status code 401"`
        );
        expect(mockLoginSilently).toHaveBeenCalledTimes(1);
      });

      test('manually trigger authentication', async () => {
        const onAuthenticate = jest.fn().mockImplementationOnce(login => {
          login.skip();
        });
        const cdp = await CDP.createClientWithOAuth({
          project,
          onAuthenticate,
        });
        await expect(cdp.authenticate()).resolves.toBe(false);
        expect(mockLoginSilently).toHaveBeenCalledTimes(1);
      });

      test('handle error query params', async () => {
        const onAuthenticate = jest.fn();
        const cdp = await CDP.createClientWithOAuth({
          project,
          onAuthenticate,
        });
        const errorMessage = 'Failed login';
        mockLoginSilently.mockImplementationOnce(() => {
          throw Error(errorMessage);
        });
        await expect(cdp.authenticate()).rejects.toThrowError(errorMessage);
      });

      test('retry request after silent login', async () => {
        const axiosInstance = generateAxiosInstance(baseUrl);
        const axiosMock = new MockAdapter(axiosInstance);
        const onAuthenticate = jest.fn();
        const cdp = await CDP.createClientWithOAuth({
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
        const response = await cdp.get('/');
        expect(response.data).toBe(body);
      });

      test(
        'handle 401 from /login/status when authenticating',
        async () => {
          const axiosInstance = generateAxiosInstance(baseUrl);
          const axiosMock = new MockAdapter(axiosInstance);
          const onAuthenticate = jest.fn();
          const cdp = await CDP.createClientWithOAuth({
            project,
            onAuthenticate,
            _axiosInstance: axiosInstance,
          });
          expect.assertions(1);
          mockLoginSilently.mockImplementationOnce(async () => {
            await expect(
              getIdInfoFromAccessToken(axiosInstance, authTokens.accessToken)
            ).resolves.toBeNull();
            return authTokens;
          });
          axiosMock.onGet('/').replyOnce(401);
          axiosMock
            .onGet('/login/status')
            .replyOnce(401, { error: { code: 401, message: 'Unauthorized' } });
          axiosMock.onGet('/').reply(200);
          await cdp.get('/');
        },
        500
      );
    });
  });

  describe('getApiKeyInfo', () => {
    test('valid apikey', async () => {
      const axiosInstance = generateAxiosInstance(baseUrl);
      const axiosMock = new MockAdapter(axiosInstance);
      axiosMock
        .onGet(`${baseUrl}/login/status`)
        .replyOnce(200, { data: loginInfo });
      await expect(
        CDP.getApiKeyInfo(apiKey, baseUrl, axiosInstance)
      ).resolves.toEqual({
        project: loginInfo.project,
        user: loginInfo.user,
      });
    });

    test('invalid api-key', async () => {
      const axiosInstance = generateAxiosInstance(baseUrl);
      const axiosMock = new MockAdapter(axiosInstance);
      axiosMock.onGet(`${baseUrl}/login/status`).replyOnce(401, { error: {} });
      await expect(
        CDP.getApiKeyInfo(apiKey, baseUrl, axiosInstance)
      ).resolves.toBeNull();
    });

    test('logged out api-key', async () => {
      const axiosInstance = generateAxiosInstance(baseUrl);
      const axiosMock = new MockAdapter(axiosInstance);
      axiosMock
        .onGet(`${baseUrl}/login/status`)
        .replyOnce(200, { data: { loggedIn: false } });
      await expect(
        CDP.getApiKeyInfo(apiKey, baseUrl, axiosInstance)
      ).resolves.toBeNull();
    });
  });
});
