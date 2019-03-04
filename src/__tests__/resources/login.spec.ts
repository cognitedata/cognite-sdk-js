// Copyright 2019 Cognite AS

import {
  clearParametersFromUrl,
  generateLoginUrl,
  parseTokenQueryParameters,
} from '../../resources/login';

describe('Login', () => {
  test('clearParametersFromUrl', () => {
    window.history.pushState(
      {},
      '',
      `/some/random/path?query=true&access_token=abc&id_token=abc&random=123`
    );
    clearParametersFromUrl('access_token', 'id_token');
    expect(window.location.href).toMatchInlineSnapshot(
      `"https://localhost/some/random/path?query=true&random=123"`
    );
  });

  test('generateLoginUrl', () => {
    expect(
      generateLoginUrl({
        baseUrl: 'https://example.com',
        redirectUrl: 'https://redirect.com',
        errorRedirectUrl: 'https://errorRedirect.com',
        project: 'my-tenant',
      })
    ).toMatchInlineSnapshot(
      `"https://example.com/login/redirect?errorRedirectUrl=https%3A%2F%2FerrorRedirect.com&project=my-tenant&redirectUrl=https%3A%2F%2Fredirect.com"`
    );
  });

  describe('parseTokenQueryParameters', () => {
    test('tokens in url', () => {
      expect(
        parseTokenQueryParameters('?id_token=abc&access_token=def')
      ).toEqual({
        idToken: 'abc',
        accessToken: 'def',
      });
    });

    test('no tokens', () => {
      expect(parseTokenQueryParameters('?another_query_param=def')).toBeNull();
    });

    test('errors', () => {
      expect(() =>
        parseTokenQueryParameters('?error=Failed&error_description=abc')
      ).toThrowErrorMatchingInlineSnapshot(`"Failed: abc"`);
    });
  });
});
