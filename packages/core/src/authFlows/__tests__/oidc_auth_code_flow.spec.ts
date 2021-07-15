import { OidcAuthCode } from '../oidc_auth_code_flow';

const originalLocalStorage = localStorage;
const localStorageGetItem = jest.fn();
const localStorageSetItem = jest.fn();
const localStorageRemoveItem = jest.fn();

const originalHistory = history;
const localReplaceState = jest.fn();

const signinRedirectCallback = jest.fn();
const getUser = jest.fn();
const signinSilent = jest.fn();
const signinRedirect = jest.fn();
const signinPopup = jest.fn();

jest.mock('oidc-client', () => {
  return {
    WebStorageStateStore: jest.fn(),
    UserManager: jest.fn().mockImplementation(() => {
      return {
        signinRedirectCallback,
        getUser,
        signinSilent,
        signinRedirect,
        signinPopup,
      };
    }),
  };
});

describe('OidcAuthCode', () => {
  beforeAll(() => {
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: localStorageGetItem,
        setItem: localStorageSetItem,
        removeItem: localStorageRemoveItem,
      },
      writable: true,
    });
    Object.defineProperty(window, 'history', {
      value: {
        replaceState: localReplaceState,
        state: { abc: 123 },
      },
      writable: true,
    });
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
  afterAll(() => {
    Object.defineProperty(window, 'localStorage', {
      value: originalLocalStorage,
    });
    Object.defineProperty(window, 'history', {
      value: originalHistory,
    });
  });

  describe('init', () => {
    describe('redirect handling', () => {
      test('call signinRedirectCallback', async () => {
        const adc = new OidcAuthCode({
          clientId: '123',
          openIdConfigurationUrl:
            'https://idp.example.org/.well-known/openid-configuration',
          responseMode: 'code',
        });

        signinRedirectCallback.mockResolvedValueOnce({
          idToken: 123,
          expired: false,
        });
        const user = await adc.init();

        expect(signinRedirectCallback).toBeCalled();
        expect(user).toEqual({ idToken: 123, expired: false });
      });
    });

    describe('error handling', () => {
      describe('running init when there is no redirect state', () => {
        test('the exception should be silently ignored', async () => {
          const adc = new OidcAuthCode({
            clientId: '123',
            openIdConfigurationUrl:
              'https://idp.example.org/.well-known/openid-configuration',
            responseMode: 'code',
          });

          getUser.mockResolvedValue({ idToken: '42', expired: false });
          signinRedirectCallback.mockRejectedValueOnce(
            new Error('No state in response')
          );

          const user = await adc.init();

          expect(signinRedirectCallback).toBeCalled();
          expect(user).toEqual({ idToken: '42', expired: false });
        });

        test('handled exeptions, leading to getting local users should refresh expired local users', async () => {
          const adc = new OidcAuthCode({
            clientId: '123',
            openIdConfigurationUrl:
              'https://idp.example.org/.well-known/openid-configuration',
            responseMode: 'code',
            refreshParams: { audience: 'foo' },
          });

          getUser.mockResolvedValue({ idToken: '42', expired: true });
          signinSilent.mockResolvedValueOnce({ idToken: '43', expired: false });
          signinRedirectCallback.mockRejectedValueOnce(
            new Error('No state in response')
          );

          const user = await adc.init();

          expect(signinRedirectCallback).toBeCalled();
          expect(signinSilent).toHaveBeenCalledWith({ audience: 'foo' });
          expect(user).toEqual({ idToken: '43', expired: false });
        });
      });

      describe('running init there is not state in local storage', () => {
        test('the exception should be silently ignored', async () => {
          const adc = new OidcAuthCode({
            clientId: '123',
            openIdConfigurationUrl:
              'https://idp.example.org/.well-known/openid-configuration',
            responseMode: 'code',
          });

          getUser.mockResolvedValue({ idToken: '42', expired: false });
          signinRedirectCallback.mockRejectedValueOnce(
            new Error('No matching state found in storage')
          );

          const user = await adc.init();

          expect(signinRedirectCallback).toBeCalled();
          expect(user).toEqual({ idToken: '42', expired: false });
        });
      });

      describe('other exceptions should bubble through', () => {
        test('the exception should be silently ignored', async () => {
          const adc = new OidcAuthCode({
            clientId: '123',
            openIdConfigurationUrl:
              'https://idp.example.org/.well-known/openid-configuration',
            responseMode: 'code',
          });

          getUser.mockResolvedValue({ idToken: '42', expired: false });
          signinRedirectCallback.mockRejectedValueOnce(new Error('IDP error'));

          await expect(adc.init()).rejects.toEqual(new Error('IDP error'));
        });
      });
    });

    describe('restoring browser state', () => {
      test('read state from LS, update history and remove data from LS', async () => {
        const adc = new OidcAuthCode({
          clientId: '123',
          openIdConfigurationUrl:
            'https://idp.example.org/.well-known/openid-configuration',
          responseMode: 'code',
        });

        signinRedirectCallback.mockResolvedValue(null);
        localStorageGetItem.mockReturnValueOnce(
          JSON.stringify({
            title: 'hello world',
            href: 'https://example.org/1/2/3',
            state: { hello: 'world' },
          })
        );

        await adc.init();

        expect(localStorageGetItem).toHaveBeenCalledWith(
          '@cognite/sdk:oidAuthCodeRedirect'
        );
        expect(localReplaceState).toHaveBeenCalledWith(
          { hello: 'world' },
          'hello world',
          'https://example.org/1/2/3'
        );
        expect(localStorageRemoveItem).toHaveBeenCalledWith(
          '@cognite/sdk:oidAuthCodeRedirect'
        );
      });
    });
  });

  describe('getUser', () => {
    test('setting fresh=true should silently get an updated token', async () => {
      const adc = new OidcAuthCode({
        clientId: '123',
        openIdConfigurationUrl:
          'https://idp.example.org/.well-known/openid-configuration',
        responseMode: 'code',
      });

      getUser.mockResolvedValueOnce(null);
      signinSilent.mockResolvedValueOnce({ idToken: 'hello' });

      const user = await adc.getUser(true);
      expect(getUser).toBeCalled();
      expect(signinSilent).toBeCalled();
      expect(user).toEqual({ idToken: 'hello' });
    });

    test('setting fresh=false should silently get an updated token if the user has expired', async () => {
      const adc = new OidcAuthCode({
        clientId: '123',
        openIdConfigurationUrl:
          'https://idp.example.org/.well-known/openid-configuration',
        responseMode: 'code',
      });

      getUser.mockResolvedValueOnce({ idToken: 'hello', expired: true });
      signinSilent.mockResolvedValueOnce({ idToken: 'hello', expired: false });

      const user = await adc.getUser();
      expect(getUser).toBeCalled();
      expect(signinSilent).toBeCalled();
      expect(user).toEqual({ idToken: 'hello', expired: false });
    });

    test('options.refreshParams should be passed to signinSilent', async () => {
      const adc = new OidcAuthCode({
        clientId: '123',
        openIdConfigurationUrl:
          'https://idp.example.org/.well-known/openid-configuration',
        responseMode: 'code',
        refreshParams: { audience: 'foo' },
      });

      getUser.mockResolvedValueOnce(null);
      signinSilent.mockResolvedValueOnce({ idToken: 'hello', expired: false });

      await adc.getUser();

      expect(signinSilent).toHaveBeenCalledWith({ audience: 'foo' });
    });

    test('setting fresh=false should not silently refresh the user if the user has not expired', async () => {
      const adc = new OidcAuthCode({
        clientId: '123',
        openIdConfigurationUrl:
          'https://idp.example.org/.well-known/openid-configuration',
        responseMode: 'code',
      });

      getUser.mockResolvedValueOnce({ idToken: 'hello', expired: false });
      signinSilent.mockResolvedValueOnce({ idToken: 'hello', expired: false });

      const user = await adc.getUser();
      expect(getUser).toBeCalled();
      expect(signinSilent).not.toBeCalled();
      expect(user).toEqual({ idToken: 'hello', expired: false });
    });
  });

  describe('login', () => {
    describe('REDIRECT mode', () => {
      test('REDIRECT should be the default', async () => {
        const adc = new OidcAuthCode({
          clientId: '123',
          openIdConfigurationUrl:
            'https://idp.example.org/.well-known/openid-configuration',
          responseMode: 'code',
          interactionType: undefined,
        });

        signinRedirect.mockResolvedValueOnce(null);

        // login without params should be redirect
        await adc.login();

        expect(signinRedirect).toBeCalledTimes(1);
        expect(signinPopup).not.toBeCalled();
      });

      test('options.loginParmas should be passed to signinRedirect', async () => {
        const adc = new OidcAuthCode({
          clientId: '123',
          openIdConfigurationUrl:
            'https://idp.example.org/.well-known/openid-configuration',
          responseMode: 'code',
          loginParams: { audience: 'foo' },
        });

        signinRedirect.mockResolvedValueOnce(null);

        await adc.login();

        expect(signinRedirect).toHaveBeenLastCalledWith({ audience: 'foo' });
      });

      test('current browser state should be saved in local storage', async () => {
        const adc = new OidcAuthCode({
          clientId: '123',
          openIdConfigurationUrl:
            'https://idp.example.org/.well-known/openid-configuration',
          responseMode: 'code',
          interactionType: 'REDIRECT',
        });

        signinRedirect.mockResolvedValueOnce(null);

        await adc.login();
        expect(localStorageSetItem).toBeCalledTimes(1);
        expect(signinRedirect).toBeCalledTimes(1);

        expect(localStorageSetItem).toHaveBeenLastCalledWith(
          '@cognite/sdk:oidAuthCodeRedirect',
          '{"href":"https://localhost/","state":{"abc":123},"title":""}'
        );
      });
    });

    describe('POPUP mode', () => {
      test('should only call signinPopup', async () => {
        const adc = new OidcAuthCode({
          clientId: '123',
          openIdConfigurationUrl:
            'https://idp.example.org/.well-known/openid-configuration',
          responseMode: 'code',
          interactionType: 'POPUP',
        });

        signinRedirect.mockResolvedValueOnce(null);

        await adc.login();

        expect(signinPopup).toBeCalled();
        expect(localStorageSetItem).not.toBeCalled();
        expect(signinRedirect).not.toBeCalled();
      });
    });
  });
});
