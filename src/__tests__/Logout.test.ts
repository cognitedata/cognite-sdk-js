// Copyright 2018 Cognite AS

import MockAdapter from 'axios-mock-adapter';
import { instance, Logout } from '../index';

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

describe('Logout', () => {
  test('retrieve logout url', async () => {
    const params = {
      redirectUrl: 'https://sdk.cognite.com/js',
    };
    const logoutUrl = 'https://logout.someawesomecompany.com?user=cognite';
    mock.onGet(/\/logout\/url$/, { params }).reply(200, {
      data: {
        url: logoutUrl,
      },
    });
    const result = await Logout.retrieveLogoutUrl(params);
    expect(result).toBe(logoutUrl);
  });

  test('logout', async () => {
    const loginStatus = {
      user: 'f1@cognite.com',
      loggedIn: false,
      project: 'cognite',
      projectId: 12345,
    };
    mock.onGet(/\/logout$/).reply(200, {
      data: loginStatus,
    });
    const result = await Logout.logout();
    expect(result).toEqual(loginStatus);
  });
});
