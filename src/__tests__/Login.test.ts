// Copyright 2018 Cognite AS

import MockAdapter from 'axios-mock-adapter';
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

  test('login with api key', async () => {
    const apiKey = 'test-api-key';
    const response = {
      user: 'sdk-test',
      loggedIn: true,
      project: 'cognitesdk-js',
      projectId: 12345,
    };

    mock
      .onPost(/\/login$/, {
        apiKey,
      })
      .reply(200, {
        data: response,
      });

    const result = await Login.loginWithApiKey(apiKey);
    expect(result).toEqual(response);
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
