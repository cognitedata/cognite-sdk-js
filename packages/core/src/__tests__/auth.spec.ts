// Copyright 2020 Cognite AS

import nock from 'nock';
import { AUTHORIZATION_HEADER } from '../constants';
import { CDFHttpClient } from '../httpClient/cdfHttpClient';
import { getIdInfoFromAccessToken, loginWithRedirect } from '../auth';
import { bearerString } from '../utils';
import {
  // authTokens,
  // loggedInResponse,
  notLoggedInResponse,
  project,
  projectId,
  mockBaseUrl,
} from '../testUtils';
import { createUniversalRetryValidator } from '../httpClient/retryValidator';

describe('Login', () => {
  const response401 = { error: { code: 401, message: '' } };
  const statusPath = '/login/status';
  const httpClient = new CDFHttpClient(
    mockBaseUrl,
    createUniversalRetryValidator()
  );

  beforeEach(() => {
    window.history.pushState({}, '', '');
    nock.cleanAll();
  });

  describe('loginSilently', () => {
    // const authorizeParams = {
    //   baseUrl: mockBaseUrl,
    //   project,
    //   redirectUrl: 'https://redirect.com',
    //   errorRedirectUrl: 'https://error-redirect.com',
    // };
    beforeEach(() => {
      window.history.pushState({}, '', '');
    });
    // afterAll(() => {});

    // test('exception on error query params', async () => {
    //   window.history.pushState(
    //     {},
    //     '',
    //     `/some/random/path?query=true&error=failed&error_description=message`
    //   );
    //   await expect(
    //     loginSilently(httpClient, authorizeParams)
    //   ).rejects.toThrowErrorMatchingInlineSnapshot(`"failed: message"`);
    // });

    // test('valid tokens in url', async () => {
    //   expect.assertions(2);
    //   window.history.pushState(
    //     {},
    //     '',
    //     `/some/random/path?query=true&access_token=${
    //       authTokens.accessToken
    //     }&id_token=${authTokens.idToken}&random=123`
    //   );
    //   nock(mockBaseUrl, {
    //     reqheaders: {
    //       [AUTHORIZATION_HEADER]: bearerString(authTokens.accessToken),
    //     },
    //   })
    //     .get('/login/status')
    //     .reply(200, loggedInResponse);
    //   const tokens = await loginSilently(httpClient, authorizeParams);
    //   expect(tokens).toEqual(authTokens);
    //   expect(window.location.href).toMatchInlineSnapshot(
    //     `"https://localhost/some/random/path?query=true&random=123"`
    //   );
    // });
  });

  describe('getIdInfo', () => {
    const idInfo = {
      project,
      projectId,
      user: 'user@example.com',
    };
    const successResponse = {
      data: {
        loggedIn: true,
        ...idInfo,
      },
    };

    test('successful getIdInfoFromAccessToken', async () => {
      const token = 'abc123';
      nock(mockBaseUrl, {
        reqheaders: { [AUTHORIZATION_HEADER]: bearerString(token) },
      })
        .get(statusPath)
        .once()
        .reply(200, successResponse);
      await expect(
        getIdInfoFromAccessToken(httpClient, token)
      ).resolves.toEqual(idInfo);
    });

    test('getIdInfoFromAccessToken - 401', async () => {
      const token = 'abc123';
      nock(mockBaseUrl)
        .get(statusPath)
        .once()
        .reply(401, response401);
      await expect(
        getIdInfoFromAccessToken(httpClient, token)
      ).resolves.toBeNull();
    });

    test('getIdInfoFromAccessToken - not logged in', async () => {
      const token = 'abc123';
      nock(mockBaseUrl)
        .get(statusPath)
        .reply(200, notLoggedInResponse);
      await expect(
        getIdInfoFromAccessToken(httpClient, token)
      ).resolves.toBeNull();
    });
  });

  describe('loginWithRedirect', () => {
    const { location } = window;

    beforeAll(() => {
      delete window.location;
      window.location = { ...location, reload: jest.fn() };
    });

    afterAll(() => {
      window.location = location;
    });

    test('redirects', async done => {
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
});
