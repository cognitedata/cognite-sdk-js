import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { noop } from 'lodash-es';
import nock from 'nock';
import { sleepPromise } from '../../__tests__/testUtils';
import * as loginUtils from '../../loginUtils';
import { ADFS } from '../adfs';

describe('ADFS', () => {
  const cluster = 'test-cluster';
  const mockBaseUrl = `https://${cluster}.cognitedata.com`;
  const authority = 'https://adfs.test.com/adfs';
  const clientId = 'adfsClientId';
  const requestParams = {
    resource: mockBaseUrl,
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
    sessionStorage.clear();
  });

  describe('login', () => {
    let adfsClient: ADFS;

    beforeEach(() => {
      adfsClient = new ADFS({ authority, requestParams });
    });

    afterEach(() => {
      vi.clearAllMocks();
    });

    test('should redirect to specific url', async () => {
      const silentLogin = vi
        .spyOn(loginUtils, 'silentLoginViaIframe')
        .mockRejectedValueOnce('Can not login silently');
      let promiseResolved = false;

      adfsClient.login().then(() => {
        promiseResolved = true;
      });

      await sleepPromise(1000);
      expect(promiseResolved).toBe(false);
      expect(silentLogin).toHaveBeenCalledTimes(1);
      expect(window.location.href).toMatchInlineSnapshot(
        `"https://adfs.test.com/adfs?client_id=adfsClientId&scope=user_impersonation IDENTITY&response_mode=fragment&response_type=id_token token&resource=${mockBaseUrl}&redirect_uri=https://localhost/"`,
      );
    });

    test('should login silently', async () => {
      const { accessToken, idToken, expiresIn } = authTokens;
      function createIframe(hash: string) {
        return {
          src: '',
          style: {},
          contentWindow: {
            location: {
              hash,
            },
          },
          setAttribute: noop,
        } as HTMLIFrameElement;
      }
      const iframe = createIframe(
        `#access_token=${accessToken}&id_token=${idToken}&expires_in=${expiresIn}`,
      );
      const spiedCreateElement = vi
        .spyOn(document, 'createElement')
        .mockReturnValueOnce(iframe);
      const spiedAppendChild = vi
        .spyOn(document.body, 'appendChild')
        .mockImplementation((iframe) => {
          // @ts-ignore
          iframe.onload();
          return iframe;
        });
      const spiedRemoveChild = vi.spyOn(document.body, 'removeChild');
      const silentLogin = vi.spyOn(loginUtils, 'silentLoginViaIframe');

      const cdfToken = await adfsClient.login();

      expect(silentLogin).toHaveBeenCalledTimes(1);
      expect(spiedCreateElement).toBeCalledTimes(1);
      expect(spiedCreateElement).toBeCalledWith('iframe');
      expect(spiedAppendChild).toBeCalledWith(iframe);
      expect(spiedAppendChild).toBeCalledTimes(1);
      expect(spiedAppendChild).toBeCalledWith(iframe);
      expect(spiedRemoveChild).toBeCalledTimes(1);
      expect(spiedRemoveChild).toBeCalledWith(iframe);
      expect(iframe.src).toMatchInlineSnapshot(
        `"https://adfs.test.com/adfs?prompt=none&client_id=adfsClientId&scope=user_impersonation IDENTITY&response_mode=fragment&response_type=id_token token&resource=${mockBaseUrl}&redirect_uri=https://localhost/"`,
      );
      expect(cdfToken).toEqual(accessToken);
    });
    test('should return updated token on getCdfToken', async () => {
      const updatedAccessToken = 'updatedAccessToken';
      const updatedIdToken = 'updatedIdToken';
      const { accessToken, idToken } = authTokens;
      const silentLogin = vi
        .spyOn(loginUtils, 'silentLoginViaIframe')
        .mockResolvedValueOnce({
          accessToken,
          idToken,
          expiresIn: Date.now() + 3600 * 1000,
        })
        .mockResolvedValueOnce({
          accessToken: updatedAccessToken,
          idToken: updatedIdToken,
          expiresIn: Date.now() + 3600 * 1000,
        });

      const cdfTokenAfterLogin = await adfsClient.login();
      sessionStorage.clear(); // force silent login
      const updatedCdfToken = await adfsClient.getCDFToken();

      expect(silentLogin).toHaveBeenCalledTimes(2);
      expect(cdfTokenAfterLogin).toEqual(accessToken);
      expect(updatedCdfToken).toEqual(updatedCdfToken);
    });
    test('should return cached cdfToken if failed to get updated', async () => {
      const { accessToken, idToken } = authTokens;
      const silentLogin = vi
        .spyOn(loginUtils, 'silentLoginViaIframe')
        .mockResolvedValueOnce({
          accessToken,
          idToken,
          expiresIn: Date.now() + 3600 * 1000,
        })
        .mockRejectedValueOnce(
          'Failed to acquire token silently due X-Frame-Options header deny',
        );

      const cdfTokenAfterLogin = await adfsClient.login();
      const anotherAdfsClient = new ADFS({ authority, requestParams });
      const updatedCdfToken = await anotherAdfsClient.getCDFToken();

      expect(silentLogin).toHaveBeenCalledTimes(1);
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
        `/some/random/path#access_token=${accessToken}&id_token=${idToken}&expires_in=${expiresIn}&random=123`,
      );
      const token = adfsClient.handleLoginRedirect();

      expect(token).toBeTruthy();
      expect(token?.accessToken).toEqual(accessToken);
      expect(token?.idToken).toEqual(idToken);
      expect(window.location.href).toMatchInlineSnapshot(
        `"https://localhost/some/random/path#random=123"`,
      );
    });
    test('should return null if no token in URL', () => {
      const token = adfsClient.handleLoginRedirect();

      expect(token).toEqual(null);
    });
  });
});
