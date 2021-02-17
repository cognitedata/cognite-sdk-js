import { AzureAD } from '../aad';

const getAllAccounts = jest.fn();
const handleRedirectPromise = jest.fn();
const loginRedirect = jest.fn();
const loginPopup = jest.fn();
const acquireTokenSilent = jest.fn();

jest.mock('@azure/msal-browser', () => {
  return {
    PublicClientApplication: jest.fn().mockImplementation(() => {
      return {
        getAllAccounts,
        handleRedirectPromise,
        loginRedirect,
        loginPopup,
        acquireTokenSilent,
      };
    }),
  };
});

const cluster = 'test-cluster';
const config = {
  auth: {
    clientId: '0',
    authority: `0`,
    redirectUri: `${window.location.origin}`,
  },
};
const account = {
  homeAccountId: '1',
  environment: 'environment',
  tenantId: 'your_tenant_id',
  username: 'username',
  localAccountId: 'local_account_id',
};

let azureAdClient: AzureAD;

describe('Azure AD auth module', () => {
  beforeEach(() => {
    azureAdClient = new AzureAD({ cluster, config });
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
  test('should set cluster from config', () => {
    expect(azureAdClient.getCluster()).toEqual(cluster);
  });
  test('should change cluster', () => {
    const newClusterName = 'test';

    azureAdClient.setCluster(newClusterName);

    expect(azureAdClient.getCluster()).toEqual(newClusterName);
  });

  describe('Get accounts', () => {
    test('should return `null` in case any accounts in localstorage', () => {
      getAllAccounts.mockReturnValueOnce([]);

      expect(azureAdClient.getAccount()).toEqual(null);
    });
    test('should return first account from the localstorage', () => {
      getAllAccounts.mockReturnValueOnce(['dude 1', 'dude 2']);

      expect(azureAdClient.getAccount()).toEqual('dude 1');
    });
  });
  describe('Init authentication', () => {
    test('should return account info if available', async () => {
      handleRedirectPromise.mockReturnValueOnce({ account });
      const accountInfo = await azureAdClient.initAuth();

      expect(accountInfo).toEqual(account);
    });
    test('should get account from localstorage as a fallback if its possible', async () => {
      handleRedirectPromise.mockReturnValueOnce(null);
      getAllAccounts.mockReturnValueOnce([account]);

      const accountInfo = await azureAdClient.initAuth();

      expect(accountInfo).toEqual(account);
    });
    test('should return `null` in case if it is impossible to get account data', async () => {
      handleRedirectPromise.mockReturnValueOnce(null);
      getAllAccounts.mockReturnValueOnce([]);

      const accountInfo = await azureAdClient.initAuth();

      expect(accountInfo).toEqual(undefined);
    });
  });
  describe('Login', () => {
    test('should trigger redirect on login with empty params', async () => {
      await azureAdClient.login();

      expect(loginRedirect).toHaveBeenCalledTimes(1);
    });
    test('should return account in case of success popup login', async () => {
      loginPopup.mockResolvedValueOnce({ account });

      const accountInfo = await azureAdClient.login('loginPopup');

      expect(accountInfo).toEqual(account);
    });
  });
  describe('Get token', () => {
    test('should return `null` if not logged in', async () => {
      const token = await azureAdClient.getCDFToken();

      expect(token).toEqual(null);
    });
    test('should return token if available', async () => {
      loginPopup.mockResolvedValueOnce({ account });
      acquireTokenSilent.mockResolvedValueOnce({ accessToken: 'access_token' });

      await azureAdClient.login('loginPopup');
      const token = await azureAdClient.getCDFToken();

      expect(token).toEqual('access_token');
    });
  });
});
