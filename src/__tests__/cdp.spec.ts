// Copyright 2019 Cognite AS

import MockAdapter from 'axios-mock-adapter';
import { generateAxiosInstance } from '../axiosWrappers';
import { CDP } from '../cdp';
import { createErrorReponse } from './testUtils';

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

    test(
      'should call onAuthenticate on 401',
      async () => {
        const axiosInstance = generateAxiosInstance(baseUrl);
        const axiosMock = new MockAdapter(axiosInstance);
        const onAuthenticate = jest.fn();
        const cdp = await CDP.createClientWithOAuth({
          project,
          onAuthenticate,
          _axiosInstance: axiosInstance,
        });
        onAuthenticate.mockImplementation(login => {
          console.log('onAuthenticate');
          login.skip();
        });
        axiosMock.onGet('/401').reply(config => {
          console.log('reply...: ', config);
          return [401];
        });
        await cdp.get('/401');
        expect(onAuthenticate).toHaveBeenCalledTimes(1);
        expect(onAuthenticate.mock.calls[0][0].redirect).toBeDefined();
        expect(onAuthenticate.mock.calls[0][0].skip).toBeDefined();
      },
      1000
    );
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
