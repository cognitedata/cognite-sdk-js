// Copyright 2018 Cognite AS

import MockAdapter from 'axios-mock-adapter';
import { configure } from '../core';
import { instance, Login } from '../index';

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

describe('Login', () => {
  test('get login url', async () => {
    configure({
      baseUrl: 'https://api.cognitedata.com',
    });
    {
      const actual = Login.getLoginUrl({
        project: 'my-tenant',
        redirectUrl: 'https://mywebapp.com',
        errorRedirectUrl: 'https://mybrokenwebapp.com',
      });
      const expected =
        'https://api.cognitedata.com/login/redirect?errorRedirectUrl=https%3A%2F%2Fmybrokenwebapp.com&project=my-tenant&redirectUrl=https%3A%2F%2Fmywebapp.com';
      expect(actual).toBe(expected);
    }
    {
      const actual = Login.getLoginUrl({
        project: 'my-tenant',
        redirectUrl: 'https://mywebapp.com',
      });
      const expected =
        'https://api.cognitedata.com/login/redirect?project=my-tenant&redirectUrl=https%3A%2F%2Fmywebapp.com';
      expect(actual).toBe(expected);
    }
    {
      configure({
        project: 'abc',
        baseUrl: 'https://mynewdomain.com',
      });
      const actual = Login.getLoginUrl({
        redirectUrl: 'https://mywebapp.com',
      });
      const expected =
        'https://mynewdomain.com/login/redirect?project=abc&redirectUrl=https%3A%2F%2Fmywebapp.com';
      expect(actual).toBe(expected);
    }
  });

  test('login with redirect', async () => {
    const params = {
      project: 'cognitesdk-js',
      redirectUrl: 'https://sdk.cognite.com/js',
      errorRedirectUrl: 'https://sdk.cognite.com/js/error',
    };
    window.location.assign = jest.fn();
    Login.loginWithRedirect(params);
    expect(window.location.assign).toBeCalledTimes(1);
    expect(window.location.assign).toBeCalledWith(expect.any(String));
  });

  test('retrieve login url', async () => {
    const params = {
      project: 'cognitesdk-js',
      redirectUrl: 'https://sdk.cognite.com/js',
      errorRedirectUrl: 'https://sdk.cognite.com/js/error',
    };
    const loginUrl = 'https://login.someawesomecompany.com?user=cognite';
    mock.onGet(/\/login\/url$/, { params }).reply(200, {
      data: {
        url: loginUrl,
      },
    });
    const result = await Login.retrieveLoginUrl(params);
    expect(result).toBe(loginUrl);
  });

  describe('login with api key', () => {
    const apiKey = 'test-api-key';
    const response = {
      user: 'sdk-test',
      loggedIn: true,
      project: 'cognitesdk-js',
      projectId: 12345,
    };

    test('not defined project, apikey', async () => {
      configure({
        project: undefined,
        apiKey: undefined,
      });
      mock.onGet(/\/login\/status$/).reply(200, {
        data: response,
      });

      const result = await Login.loginWithApiKey(apiKey);
      expect(result).toEqual(response);
      expect(configure({}).apiKey).toBe(apiKey);
      expect(configure({}).project).toBe(response.project);
    });

    test('not matching project', async () => {
      configure({
        project: 'another-project',
        apiKey: undefined,
      });
      mock.onGet(/\/login\/status$/).reply(200, {
        data: response,
      });
      await expect(Login.loginWithApiKey(apiKey)).rejects.toThrow();
    });

    test('defined apiKey', async () => {
      configure({
        project: undefined,
        apiKey: 'some-api-key',
      });
      mock.onGet(/\/login\/status$/).reply(200, {
        data: response,
      });
      const result = await Login.loginWithApiKey(apiKey);
      expect(result).toEqual(response);
      expect(configure({}).apiKey).toBe(apiKey);
      expect(configure({}).project).toBe(response.project);
    });
  });

  test('validate jwt', async () => {
    const token = 'ewogIgp9.ewogICY1Cn0=.c42g3p5hKqcL/RoBgK/Pj/Rl2j/4diA==';
    const response = {
      token,
      valid: true,
      expired: false,
    };
    mock
      .onGet(/\/login\/token$/, {
        params: { token },
      })
      .reply(200, {
        data: response,
      });
    const result = await Login.validateJWT(token);
    expect(result).toEqual(response);
  });

  test('verify login status', async () => {
    const response = {
      user: 'f1@cognite.com',
      loggedIn: true,
      project: 'cognite',
      projectId: 12345,
    };
    mock.onGet(/\/login\/status$/).reply(200, {
      data: response,
    });
    const result = await Login.verifyStatus();
    expect(result).toEqual(response);
  });
});
