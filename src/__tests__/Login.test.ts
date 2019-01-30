// Copyright 2018 Cognite AS

import MockAdapter from 'axios-mock-adapter';
import * as jwt from 'jwt-simple';
import { configure } from '../core';
import { instance } from '../index';
import { Login, LoginParams } from '../Login';

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
        errorRedirectUrl: 'https://mywebapp.com',
      });
      const expected =
        'https://api.cognitedata.com/login/redirect?errorRedirectUrl=https%3A%2F%2Fmywebapp.com&project=my-tenant&redirectUrl=https%3A%2F%2Fmywebapp.com';
      expect(actual).toBe(expected);
    }
    {
      configure({
        project: 'abc',
        baseUrl: 'https://mynewdomain.com',
      });
      const actual = Login.getLoginUrl({
        redirectUrl: 'https://mywebapp.com',
        errorRedirectUrl: 'https://mywebapp.com',
      });
      const expected =
        'https://mynewdomain.com/login/redirect?errorRedirectUrl=https%3A%2F%2Fmywebapp.com&project=abc&redirectUrl=https%3A%2F%2Fmywebapp.com';
      expect(actual).toBe(expected);
    }
  });

  describe('authorize', () => {
    const status = {
      user: 'user@example.com',
      project: 'my-tenant',
      projectId: 314,
    };

    const authTokens = {
      accessToken: jwt.encode({}, 'secret'),
      idToken: jwt.encode({}, 'secret'),
    };

    let spiedLoginParseQuery: jest.SpyInstance<any>;
    let spiedLoginVerifyAccessToken: jest.SpyInstance<any>;
    let spiedSilentLogin: jest.SpyInstance<any>;
    let spiedScheduleRenewal: jest.SpyInstance<any>;
    let spiedLoginWithRedirect: jest.SpyInstance<any>;

    beforeAll(() => {
      spiedLoginParseQuery = jest
        .spyOn(Login as any, 'parseQuery')
        .mockImplementation(() => null);

      spiedLoginVerifyAccessToken = jest
        .spyOn(Login as any, 'verifyAccessToken')
        .mockReturnValue({
          ...authTokens,
          ...status,
        });

      spiedSilentLogin = jest
        .spyOn(Login as any, 'silentLogin')
        .mockImplementation(() => authTokens);
      spiedScheduleRenewal = jest.spyOn(Login as any, 'scheduleRenewal');

      spiedLoginWithRedirect = jest
        .spyOn(Login, 'loginWithRedirect')
        .mockImplementation(() => {});
    });

    beforeEach(() => {
      configure({ project: '' });
    });

    afterEach(() => {
      spiedLoginParseQuery.mockClear();
      spiedLoginVerifyAccessToken.mockClear();
      spiedSilentLogin.mockClear();
      spiedScheduleRenewal.mockClear();
      spiedLoginWithRedirect.mockClear();
    });

    afterAll(() => {
      spiedLoginParseQuery.mockRestore();
      spiedLoginVerifyAccessToken.mockRestore();
      spiedSilentLogin.mockRestore();
      spiedScheduleRenewal.mockRestore();
      spiedLoginWithRedirect.mockRestore();
    });

    test('should throw on error query param', async () => {
      spiedLoginParseQuery.mockImplementationOnce(() => {
        throw new Error('queryTest');
      });

      await expect(
        Login.authorize({
          redirectUrl: window.location.href,
          errorRedirectUrl: window.location.href,
        })
      ).rejects.toThrowError('queryTest');
    });

    test('success when valid tokens is present in url', async () => {
      const spiedReplaceState = jest.spyOn(window.history, 'replaceState');

      // initial state to test if tokens is removed from the URL
      window.history.pushState(
        {},
        'Test Title',
        '/some/random/path?query=true&access_token=abc&id_token=def&random=123'
      );

      spiedLoginParseQuery.mockReturnValueOnce(() => authTokens);

      expect(
        await Login.authorize({
          redirectUrl: window.location.href,
          errorRedirectUrl: window.location.href,
        })
      ).toEqual({
        ...authTokens,
        ...status,
      });

      // test if tokens is removed from the URL
      expect(spiedReplaceState).toHaveBeenCalledTimes(1);
      expect(spiedReplaceState).toHaveBeenCalledWith(
        null,
        '',
        'https://localhost/some/random/path?query=true&random=123'
      );

      expect(configure({}).project).toBe(status.project);

      spiedReplaceState.mockRestore();
    });

    test('successful silent login', async () => {
      const params = {
        redirectUrl: window.location.href,
        errorRedirectUrl: window.location.href,
      };
      const tokenCallback = () => {};

      expect(await Login.authorize(params, tokenCallback)).toEqual({
        ...authTokens,
        ...status,
      });

      expect(spiedSilentLogin).toBeCalledTimes(1);
      expect(spiedSilentLogin).toBeCalledWith(params);

      expect(spiedScheduleRenewal).toBeCalledTimes(1);
      expect(spiedScheduleRenewal).toBeCalledWith(
        params,
        authTokens.accessToken,
        tokenCallback
      );
      expect(configure({}).project).toBe(status.project);
    });

    test('full browser redirect', async () => {
      const params = {
        redirectUrl: window.location.href,
        errorRedirectUrl: window.location.href,
      };
      const tokenCallback = () => {};

      spiedSilentLogin.mockImplementationOnce(() => {
        throw new Error(); // fail silent login to trigger full redirect
      });

      await Login.authorize(params, tokenCallback);
      expect(spiedSilentLogin).toBeCalledTimes(1);

      expect(spiedLoginWithRedirect).toBeCalledTimes(1);
      expect(spiedLoginWithRedirect).toBeCalledWith(params);
    });
  });

  test('login with redirect', async () => {
    const params = {
      project: 'cognitesdk-js',
      redirectUrl: 'https://sdk.cognite.com/js',
      errorRedirectUrl: 'https://sdk.cognite.com/js/error',
    };
    const spiedLocationAssign = jest
      .spyOn(window.location, 'assign')
      .mockImplementation(() => {});
    Login.loginWithRedirect(params);
    expect(spiedLocationAssign).toBeCalledTimes(1);
    expect(spiedLocationAssign).toBeCalledWith(Login.getLoginUrl(params));
    spiedLocationAssign.mockRestore();
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

  describe('parse query', () => {
    test('non valid tokens', () => {
      expect((Login as any).parseQuery('?access_token=abc')).toBe(null);
      expect((Login as any).parseQuery('?id_token=abc')).toBe(null);
    });

    test('valid tokens', () => {
      expect(
        (Login as any).parseQuery('?access_token=abc&id_token=def')
      ).toEqual({
        accessToken: 'abc',
        idToken: 'def',
      });

      expect(
        (Login as any).parseQuery(
          '?random1=yo&id_token=def&random2&access_token=abc&'
        )
      ).toEqual({
        accessToken: 'abc',
        idToken: 'def',
      });
    });

    test('eror tokens', () => {
      expect(() => {
        (Login as any).parseQuery(
          '?error=failure&error_description=error_message'
        );
      }).toThrowError('failure: error_message');

      expect(() => {
        (Login as any).parseQuery('?error&error_description=error_message');
      }).toThrowError(': error_message');

      expect(() => {
        (Login as any).parseQuery('?error');
      }).toThrowError(': ');

      expect(() => {
        (Login as any).parseQuery('?error=failure');
      }).toThrowError('failure: ');
    });
  });

  describe('schedule renewal', () => {
    jest.useFakeTimers();
    const timeLeftToRenewInMs = 50000; // 50 sec
    test('valid short living token', () => {
      const loginParams: LoginParams = {
        project: 'my-tenant',
        redirectUrl: 'https://localhost',
        errorRedirectUrl: 'https://localhost',
      };
      const tokenCallbackMock = jest.fn();
      const accessToken = jwt.encode(
        {
          expire_time: Date.now() / 1000, // expiring token
        },
        'secret'
      );

      (Login as any).scheduleRenewal(
        loginParams,
        accessToken,
        tokenCallbackMock,
        timeLeftToRenewInMs,
        5000
      );

      const spiedLoginAuthorize = jest
        .spyOn(Login, 'authorize')
        .mockImplementation(() => {});

      jest.advanceTimersByTime(4500);
      expect(Login.authorize).not.toBeCalled();

      jest.advanceTimersByTime(500);
      expect(Login.authorize).toBeCalledTimes(1);
      expect(Login.authorize).toBeCalledWith(loginParams, tokenCallbackMock);

      spiedLoginAuthorize.mockRestore();
    });

    test('valid long living token', () => {
      const loginParams: LoginParams = {
        project: 'my-tenant',
        redirectUrl: 'https://localhost',
        errorRedirectUrl: 'https://localhost',
      };
      const tokenCallbackMock = jest.fn();
      const nextYearInMs = Date.now() + 365 * 24 * 60 * 60 * 1000;
      const accessToken = jwt.encode(
        {
          expire_time: nextYearInMs / 1000, // token that lives long enough
        },
        'secret'
      );

      (Login as any).scheduleRenewal(
        loginParams,
        accessToken,
        tokenCallbackMock,
        timeLeftToRenewInMs,
        5000
      );

      const spiedLoginAuthorize = jest.spyOn(Login, 'authorize');
      jest.runOnlyPendingTimers();
      expect(spiedLoginAuthorize).not.toBeCalled();
      spiedLoginAuthorize.mockRestore();
    });
  });

  describe('silent login', async () => {
    let spiedCreateElement: jest.SpyInstance<any>;
    let spiedBodyAppendChild: jest.SpyInstance<any>;
    let spiedBodyRemoveChild: jest.SpyInstance<any>;

    beforeAll(() => {
      spiedCreateElement = jest.spyOn(document, 'createElement');
      spiedBodyAppendChild = jest
        .spyOn(document.body, 'appendChild')
        .mockImplementation(iframe => {
          iframe.onload();
        });
      spiedBodyRemoveChild = jest
        .spyOn(document.body, 'removeChild')
        .mockImplementation(() => {});
    });

    afterEach(() => {
      spiedCreateElement.mockClear();
      spiedBodyAppendChild.mockClear();
      spiedBodyRemoveChild.mockClear();
    });

    afterAll(() => {
      spiedCreateElement.mockRestore();
      spiedBodyAppendChild.mockRestore();
      spiedBodyRemoveChild.mockRestore();
    });

    test('invalid tokens', async () => {
      const params: LoginParams = {
        project: 'my-tenant',
        redirectUrl: 'https://localhost/some/random/path',
        errorRedirectUrl: 'https://localhost/some/random/path',
      };

      let iframe: any = {};

      spiedCreateElement.mockImplementationOnce(() => {
        iframe = {
          style: {},
          onload: () => {},
          contentWindow: {
            location: {
              search: '',
            },
          },
          src: '',
        };
        return iframe;
      });

      await expect((Login as any).silentLogin(params)).rejects.toThrowError(
        'Failed to login'
      );

      expect(spiedCreateElement).toBeCalledTimes(1);
      expect(spiedCreateElement).toBeCalledWith('iframe');

      expect(spiedBodyAppendChild).toBeCalledTimes(1);
      expect(spiedBodyAppendChild).toBeCalledWith(iframe);

      expect(spiedBodyRemoveChild).toBeCalledTimes(1);
      expect(spiedBodyRemoveChild).toBeCalledWith(iframe);

      expect(iframe.src).toBe(`${Login.getLoginUrl(params)}&prompt=none`);
    });

    test('valid tokens', async () => {
      const params: LoginParams = {
        project: 'my-tenant',
        redirectUrl: 'https://localhost/some/random/path',
        errorRedirectUrl: 'https://localhost/some/random/path',
      };

      let iframe: any = {};

      spiedCreateElement.mockImplementationOnce(() => {
        iframe = {
          style: {},
          onload: () => {},
          contentWindow: {
            location: {
              search: '?access_token=abc&id_token=def',
            },
          },
        };
        return iframe;
      });

      await expect((Login as any).silentLogin(params)).resolves.toEqual({
        accessToken: 'abc',
        idToken: 'def',
      });

      expect(spiedCreateElement).toBeCalledTimes(1);
      expect(spiedCreateElement).toBeCalledWith('iframe');

      expect(spiedBodyAppendChild).toBeCalledTimes(1);
      expect(spiedBodyAppendChild).toBeCalledWith(iframe);

      expect(spiedBodyRemoveChild).toBeCalledTimes(1);
      expect(spiedBodyRemoveChild).toBeCalledWith(iframe);

      expect(iframe.src).toBe(`${Login.getLoginUrl(params)}&prompt=none`);
    });
  });

  test('verify access status', async () => {
    const spiedLoginVerifyStatus = jest.spyOn(Login, 'verifyStatus');
    const authTokens = {
      accessToken: 'abc',
      idToken: 'def',
    };
    spiedLoginVerifyStatus.mockReturnValueOnce({
      loggedIn: false,
    });

    const status = {
      user: 'user@example.com',
      project: 'my-tenant',
      projectId: 314,
    };
    spiedLoginVerifyStatus.mockReturnValueOnce({
      ...status,
      loggedIn: true,
    });

    expect(await (Login as any).verifyAccessToken(authTokens)).toBe(null);
    expect(await (Login as any).verifyAccessToken(authTokens)).toEqual({
      ...authTokens,
      ...status,
    });

    expect(instance.defaults.headers.Authorization).toBe(
      `Bearer ${authTokens.accessToken}`
    );

    spiedLoginVerifyStatus.mockRestore();
  });
});
