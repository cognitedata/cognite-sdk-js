import nock from 'nock';
import { ADFS } from '../adfs';
import * as loginUtils from '../loginUtils';

describe('ADFS', () => {
  const cluster = 'test-cluster';
  const mockBaseUrl = `https://${cluster}.cognitedata.com`;
  const authority = 'https://adfs.test.com/adfs';
  const clientId = 'adfsClientId';
  const requestParams = {
    cluster,
    clientId,
  };
  const authTokens = {
    idToken: 'idToken',
    accessToken: 'accessToken',
    expiresIn: '3600',
  };

  beforeEach(() => {
    window.history.pushState({}, '', '');
    nock.cleanAll();
  });

  describe('login', () => {
    const { location } = window;
    let adfsClient: ADFS;

    beforeAll(() => {
      delete window.location;
      window.location = {
        ...location,
        hostname: 'localhost',
        href: 'https://localhost',
      };
    });

    beforeEach(() => {
      adfsClient = new ADFS({ authority, requestParams });
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    afterAll(() => {
      window.location = location;
    });

    test('should redirect to specific url', done => {
      const silentLogin = jest
        .spyOn(loginUtils, 'silentLoginViaIframe')
        .mockRejectedValueOnce('Can not login silently');
      let promiseResolved = false;

      adfsClient.login().then(() => (promiseResolved = true));

      setTimeout(() => {
        expect(promiseResolved).toBe(false);
        expect(silentLogin).toHaveBeenCalledTimes(1);
        expect(window.location.href).toMatchInlineSnapshot(
          `"https://adfs.test.com/adfs?client_id=adfsClientId&scope=user_impersonation IDENTITY&response_mode=fragment&response_type=id_token token&resource=${mockBaseUrl}&redirect_uri=https://localhost"`
        );

        done();
      }, 1000);
    });
    test('should login silently', async () => {
      const { accessToken, idToken } = authTokens;
      const silentLogin = jest
        .spyOn(loginUtils, 'silentLoginViaIframe')
        .mockResolvedValueOnce({
          accessToken,
          idToken,
          expiredIn: Date.now() + 3600 * 1000,
        });

      const cdfToken = await adfsClient.login();

      expect(silentLogin).toHaveBeenCalledTimes(1);
      expect(cdfToken).toEqual(accessToken);
    });
    test('should return updated token on getCdfToken', async () => {
      const updatedAccessToken = 'updatedAccessToken';
      const updatedIdToken = 'updatedIdToken';
      const { accessToken, idToken } = authTokens;
      const silentLogin = jest
        .spyOn(loginUtils, 'silentLoginViaIframe')
        .mockResolvedValueOnce({
          accessToken,
          idToken,
          expiredIn: Date.now() + 3600 * 1000,
        })
        .mockResolvedValueOnce({
          accessToken: updatedAccessToken,
          idToken: updatedIdToken,
          expiredIn: Date.now() + 3600 * 1000,
        });

      const cdfTokenAfterLogin = await adfsClient.login();
      const updatedCdfToken = await adfsClient.getCDFToken();

      expect(silentLogin).toHaveBeenCalledTimes(2);
      expect(cdfTokenAfterLogin).toEqual(accessToken);
      expect(updatedCdfToken).toEqual(updatedCdfToken);
    });
    test('should return cached cdfToken if failed to get updated', async () => {
      const { accessToken, idToken } = authTokens;
      const silentLogin = jest
        .spyOn(loginUtils, 'silentLoginViaIframe')
        .mockResolvedValueOnce({
          accessToken,
          idToken,
          expiredIn: Date.now() + 3600 * 1000,
        })
        .mockRejectedValueOnce(
          'Failed to acquire token silently due X-Frame-Options header deny'
        );

      const cdfTokenAfterLogin = await adfsClient.login();
      const updatedCdfToken = await adfsClient.getCDFToken();

      expect(silentLogin).toHaveBeenCalledTimes(2);
      expect(cdfTokenAfterLogin).toEqual(accessToken);
      expect(updatedCdfToken).toEqual(accessToken);
    });
  });
  describe('handle redirect', () => {
    let adfsClient: ADFS;

    beforeEach(() => {
      adfsClient = new ADFS({ authority, requestParams });
      window.history.pushState({}, '', '');
    });

    test('should parse token from redirected url', () => {
      const { expiresIn, accessToken, idToken } = authTokens;
      window.history.pushState(
        {},
        '',
        `/some/random/path#access_token=${accessToken}&id_token=${idToken}&expires_in=${expiresIn}&random=123`
      );
      const token = adfsClient.handleLoginRedirect();

      expect(token).toBeTruthy();
      expect(token!.accessToken).toEqual(accessToken);
      expect(token!.idToken).toEqual(idToken);
      expect(window.location.href).toMatchInlineSnapshot(
        `"https://localhost/some/random/path#random=123"`
      );
    });
    test('should return null if no token in URL', () => {
      const token = adfsClient.handleLoginRedirect();

      expect(token).toEqual(null);
    });
  });
});
