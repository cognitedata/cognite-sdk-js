// Copyright 2019 Cognite AS

import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import {
  getIdInfoFromAccessToken,
  getIdInfoFromApiKey,
  loginSilently,
  loginWithRedirect,
} from '../../resources/login';
import {
  apiKey,
  authTokens,
  baseUrl,
  loggedInResponse,
  notLoggedInResponse,
  project,
} from '../testUtils';

describe('Login', () => {
  const response401 = { error: { code: 401, message: '' } };
  const statusUrl = `${baseUrl}/login/status`;
  const axiosInstance = axios.create({ baseURL: baseUrl });
  const axiosMock = new MockAdapter(axiosInstance);

  beforeEach(() => {
    axiosMock.reset();
    window.history.pushState({}, '', '');
  });

  describe('loginSilently', () => {
    const authorizeParams = {
      baseUrl,
      project,
      redirectUrl: 'https://redirect.com',
      errorRedirectUrl: 'https://error-redirect.com',
    };
    const spiedCreateElement = jest.spyOn(document, 'createElement');
    const spiedAppendChild = jest.spyOn(document.body, 'appendChild');
    spiedAppendChild.mockImplementation(iframe => {
      iframe.onload();
    });
    const spiedRemoveChild = jest.spyOn(document.body, 'removeChild');
    beforeEach(() => {
      spiedCreateElement.mockReset();
      spiedRemoveChild.mockReset();
      window.history.pushState({}, '', '');
    });
    afterAll(() => {
      spiedCreateElement.mockRestore();
      spiedAppendChild.mockRestore();
      spiedRemoveChild.mockRestore();
    });

    test('exception on error query params', async () => {
      window.history.pushState(
        {},
        '',
        `/some/random/path?query=true&error=failed&error_description=message`
      );
      await expect(
        loginSilently(axiosInstance, authorizeParams)
      ).rejects.toThrowErrorMatchingInlineSnapshot(`"failed: message"`);
    });

    function createIframe(search: string) {
      return {
        src: '',
        style: {},
        contentWindow: {
          location: {
            search,
          },
        },
      };
    }
    test('silent login', async () => {
      window.history.pushState({}, '', '/abc/def');
      expect.assertions(9);
      const iframe = createIframe(
        `?access_token=${authTokens.accessToken}&id_token=${authTokens.idToken}`
      );
      spiedCreateElement.mockReturnValueOnce(iframe);
      const tokens = await loginSilently(axiosInstance, authorizeParams);
      expect(tokens).toEqual(authTokens);
      expect(spiedCreateElement).toBeCalledTimes(1);
      expect(spiedCreateElement).toBeCalledWith('iframe');
      expect(spiedAppendChild).toBeCalledWith(iframe);
      expect(spiedAppendChild).toBeCalledTimes(1);
      expect(spiedAppendChild).toBeCalledWith(iframe);
      expect(spiedRemoveChild).toBeCalledTimes(1);
      expect(spiedRemoveChild).toBeCalledWith(iframe);
      expect(iframe.src).toMatchInlineSnapshot(
        `"https://example.com/login/redirect?errorRedirectUrl=https%3A%2F%2Flocalhost%2Fabc%2Fdef&project=TEST_PROJECT&redirectUrl=https%3A%2F%2Flocalhost%2Fabc%2Fdef&prompt=none"`
      );
    });

    test('valid tokens in url', async () => {
      expect.assertions(3);
      window.history.pushState(
        {},
        '',
        `/some/random/path?query=true&access_token=${
          authTokens.accessToken
        }&id_token=${authTokens.idToken}&random=123`
      );
      axiosMock.onGet(`${baseUrl}/login/status`).replyOnce(config => {
        expect(config.headers.Authorization).toBe(
          `Bearer ${authTokens.accessToken}`
        );
        return [200, loggedInResponse];
      });
      const tokens = await loginSilently(axiosInstance, authorizeParams);
      expect(tokens).toEqual(authTokens);
      expect(window.location.href).toMatchInlineSnapshot(
        `"https://localhost/some/random/path?query=true&random=123"`
      );
    });
  });

  describe('getIdInfo', () => {
    const idInfo = {
      project,
      user: 'user@example.com',
    };
    const successResponse = {
      data: {
        loggedIn: true,
        projectId: 1,
        ...idInfo,
      },
    };

    test('successful getIdInfoFromApiKey', async () => {
      axiosMock.onGet(statusUrl).replyOnce(config => {
        expect(config.headers['api-key']).toBe(apiKey);
        return [200, successResponse];
      });
      await expect(getIdInfoFromApiKey(axiosInstance, apiKey)).resolves.toEqual(
        idInfo
      );
    });

    test('getIdInfoFromApiKey - 401', async () => {
      axiosMock.onGet(statusUrl).replyOnce(401, response401);
      await expect(
        getIdInfoFromApiKey(axiosInstance, apiKey)
      ).resolves.toBeNull();
    });

    test('getIdInfoFromApiKey - not logged in', async () => {
      axiosMock.onGet(statusUrl).replyOnce(200, notLoggedInResponse);
      await expect(
        getIdInfoFromApiKey(axiosInstance, apiKey)
      ).resolves.toBeNull();
    });

    test('successful getIdInfoFromAccessToken', async () => {
      const token = 'abc123';
      axiosMock.onGet(statusUrl).replyOnce(config => {
        expect(config.headers.Authorization).toBe(`Bearer ${token}`);
        return [200, successResponse];
      });
      await expect(
        getIdInfoFromAccessToken(axiosInstance, token)
      ).resolves.toEqual(idInfo);
    });

    test('getIdInfoFromAccessToken - 401', async () => {
      const token = 'abc123';
      axiosMock.onGet(statusUrl).replyOnce(401, response401);
      await expect(
        getIdInfoFromAccessToken(axiosInstance, token)
      ).resolves.toBeNull();
    });

    test('getIdInfoFromAccessToken - not logged in', async () => {
      const token = 'abc123';
      axiosMock.onGet(statusUrl).replyOnce(200, notLoggedInResponse);
      await expect(
        getIdInfoFromAccessToken(axiosInstance, token)
      ).resolves.toBeNull();
    });
  });

  test('loginWithRedirect', async done => {
    const spiedLocationAssign = jest
      .spyOn(window.location, 'assign')
      .mockImplementation();
    let isPromiseResolved = false;
    loginWithRedirect({
      baseUrl: 'https://example.com',
      project: 'my-tenant',
      redirectUrl: 'https://redirect.com',
      errorRedirectUrl: 'https://error-redirect.com',
    }).then(() => {
      isPromiseResolved = true;
    });
    expect(spiedLocationAssign).toBeCalledTimes(1);
    expect(spiedLocationAssign.mock.calls[0][0]).toMatchInlineSnapshot(
      `"https://example.com/login/redirect?errorRedirectUrl=https%3A%2F%2Ferror-redirect.com&project=my-tenant&redirectUrl=https%3A%2F%2Fredirect.com"`
    );
    setTimeout(() => {
      expect(isPromiseResolved).toBe(false);
      done();
    }, 1000);
  });
});
