// Copyright 2019 Cognite AS

import MockAdapter from 'axios-mock-adapter';
import { BASE_URL } from '../constants';
import { CDP } from '../index';
import { createErrorReponse } from './testUtils';

const axiosInstance = require
  .requireActual('../axiosWrappers')
  .generateAxiosInstance(BASE_URL);
jest.mock('../axiosWrappers', () => {
  return {
    ...require.requireActual('../axiosWrappers'),
    generateAxiosInstance: () => axiosInstance,
  };
});

describe('CDP', () => {
  const axiosMock = new MockAdapter(axiosInstance);
  const apiKey = 'TEST_KEY';
  const project = 'TEST_PROJECT';
  const loginInfo = {
    loggedIn: true,
    user: 'user@example.com',
    project,
    projectId: 123,
  };

  beforeEach(() => {
    axiosMock.reset();
  });

  describe('createClientWithApiKey', async () => {
    test('missing parameter', async () => {
      await expect(
        // @ts-ignore
        CDP.createClientWithApiKey()
      ).rejects.toThrowErrorMatchingInlineSnapshot(
        `"\`createClientWithApiKey\` is missing parameter \`options\`"`
      );
    });

    test('missing api key', async () => {
      await expect(
        // @ts-ignore
        CDP.createClientWithApiKey({})
      ).rejects.toThrowErrorMatchingInlineSnapshot(
        `"Property \`apiKey\` not provided to param \`options\` in \`createClientWithApiKey\`"`
      );
    });

    test('invalid api key', async () => {
      axiosMock.onGet(`${BASE_URL}/login/status`).replyOnce(config => {
        expect(config.headers['api-key']).toBe(apiKey);
        return [401, createErrorReponse(401, '')];
      });
      await expect(
        CDP.createClientWithApiKey({ apiKey })
      ).rejects.toThrowErrorMatchingInlineSnapshot(
        `"The api key provided to \`createClientWithApiKey\` is not recognized by CDP (invalid)"`
      );
    });

    test('project mismatch', async () => {
      axiosMock.onGet(`${BASE_URL}/login/status`).replyOnce(config => {
        expect(config.headers['api-key']).toBe(apiKey);
        return [200, { data: loginInfo }];
      });
      await expect(
        CDP.createClientWithApiKey({ apiKey, project: 'another-project' })
      ).rejects.toThrowErrorMatchingInlineSnapshot(
        `"Projects didn't match. Api key is for project \\"TEST_PROJECT\\" but you tried to login to \\"another-project\\""`
      );
    });

    test('set correct project', async () => {
      axiosMock
        .onGet(`${BASE_URL}/login/status`)
        .replyOnce(200, { data: loginInfo });
      const cdp = await CDP.createClientWithApiKey({ apiKey });
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
  });

  describe('getApiKeyInfo', () => {
    test('valid apikey', async () => {
      axiosMock
        .onGet(`${BASE_URL}/login/status`)
        .replyOnce(200, { data: loginInfo });
      await expect(CDP.getApiKeyInfo(apiKey)).resolves.toEqual({
        project: loginInfo.project,
        user: loginInfo.user,
      });
    });

    test('invalid api-key', async () => {
      axiosMock.onGet(`${BASE_URL}/login/status`).replyOnce(401, { error: {} });
      await expect(CDP.getApiKeyInfo(apiKey)).resolves.toBeNull();
    });

    test('logged out api-key', async () => {
      axiosMock
        .onGet(`${BASE_URL}/login/status`)
        .replyOnce(200, { data: { loggedIn: false } });
      await expect(CDP.getApiKeyInfo(apiKey)).resolves.toBeNull();
    });
  });
});
