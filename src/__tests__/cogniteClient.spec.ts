// Copyright 2019 Cognite AS

import * as nock from 'nock';
import CogniteClient, { POPUP, REDIRECT } from '../cogniteClient';
import { API_KEY_HEADER, AUTHORIZATION_HEADER } from '../constants';
import * as Login from '../resources/login';
import { bearerString, sleepPromise } from '../utils';
import {
  apiKey,
  authTokens,
  mockBaseUrl,
  project,
  setupClient,
  setupMockableClient,
} from './testUtils';

// tslint:disable-next-line:no-big-function
describe('CogniteClient', () => {
  beforeEach(() => {
    nock.cleanAll();
  });

  describe('constructor', () => {
    test('throw on missing parameter', () => {
      expect(() => {
        // @ts-ignore
        // tslint:disable-next-line:no-unused-expression
        new CogniteClient();
      }).toThrowErrorMatchingInlineSnapshot(
        `"\`CogniteClient\` is missing parameter \`options\`"`
      );
    });

    test('missing appId', () => {
      expect(() => {
        // @ts-ignore
        // tslint:disable-next-line:no-unused-expression
        new CogniteClient({});
      }).toThrowErrorMatchingInlineSnapshot(
        `"options.appId is required and must be of type string"`
      );
    });

    test('invalid appId', () => {
      expect(() => {
        // @ts-ignore
        // tslint:disable-next-line:no-unused-expression
        new CogniteClient({ appId: 12 });
      }).toThrowErrorMatchingInlineSnapshot(
        `"options.appId is required and must be of type string"`
      );
    });
  });

  describe('loginWithApiKey', () => {
    test('missing parameter', async () => {
      const client = setupClient();
      expect(
        // @ts-ignore
        () => client.loginWithApiKey()
      ).toThrowErrorMatchingInlineSnapshot(
        `"\`loginWithApiKey\` is missing parameter \`options\`"`
      );
    });

    test('missing project', async () => {
      const client = setupClient();
      expect(
        // @ts-ignore
        () => client.loginWithApiKey({})
      ).toThrowErrorMatchingInlineSnapshot(
        `"options.project is required and must be of type string"`
      );
    });

    test('missing api key', async () => {
      const client = setupClient();
      expect(
        // @ts-ignore
        () => client.loginWithApiKey({ project })
      ).toThrowErrorMatchingInlineSnapshot(
        `"options.apiKey is required and must be of type string"`
      );
    });

    test('create client with invalid api-key/project', async () => {
      const client = setupClient();
      client.loginWithApiKey({
        project,
        apiKey,
      });
    });

    test('set correct apikey', async () => {
      const client = setupMockableClient();
      client.loginWithApiKey({
        project,
        apiKey,
      });
      nock(mockBaseUrl, { reqheaders: { [API_KEY_HEADER]: apiKey } })
        .get('/test')
        .reply(200, {});
      await client.get('/test');
    });

    test('set correct project', async () => {
      const client = setupClient();
      client.loginWithApiKey({
        project,
        apiKey,
      });
      expect(client.project).toBe(project);
    });
  });

  describe('http requests', () => {
    let client: CogniteClient;

    beforeAll(async () => {
      client = setupMockableClient();
    });

    test('get method', async () => {
      nock(mockBaseUrl)
        .get('/')
        .once()
        .reply(200, []);
      const response = await client.get('/');
      expect(response.data).toEqual([]);
    });

    test('post method', async () => {
      nock(mockBaseUrl)
        .post('/')
        .once()
        .reply(200, []);
      const response = await client.post('/');
      expect(response.data).toEqual([]);
    });

    test('put method', async () => {
      nock(mockBaseUrl)
        .put('/')
        .once()
        .reply(200, []);
      const response = await client.put('/', {
        responseType: 'json',
      });
      expect(response.data).toEqual([]);
    });

    test('delete method', async () => {
      nock(mockBaseUrl)
        .delete('/')
        .once()
        .reply(200, 'abc');
      const response = await client.delete('/', { responseType: 'text' });
      expect(response.data).toBe('abc');
    });
  });

  // tslint:disable-next-line:no-big-function
  describe('loginWithOAuth', () => {
    test('missing parameter', async () => {
      const client = setupClient();
      expect(
        // @ts-ignore
        () => client.loginWithOAuth()
      ).toThrowErrorMatchingInlineSnapshot(
        `"\`loginWithOAuth\` is missing parameter \`options\`"`
      );
    });

    test('missing project name', async () => {
      const client = setupClient();
      expect(
        // @ts-ignore
        () => client.loginWithOAuth({})
      ).toThrowErrorMatchingInlineSnapshot(
        `"options.project is required and must be of type string"`
      );
    });

    describe('authentication', () => {
      let mockLoginSilently: jest.SpyInstance;
      let mockRedirect: jest.SpyInstance;
      let mockPopup: jest.SpyInstance;

      beforeEach(() => {
        mockLoginSilently = jest.spyOn(Login, 'loginSilently');
        mockLoginSilently.mockImplementation(() => {});

        mockRedirect = jest.spyOn(Login, 'loginWithRedirect');
        mockRedirect.mockImplementation(async () => {});

        mockPopup = jest.spyOn(Login, 'loginWithPopup');
        mockPopup.mockImplementation(async () => {});
      });

      afterEach(() => {
        mockLoginSilently.mockRestore();
        mockRedirect.mockRestore();
      });

      test('default onAuthenticate function should be redirect', async done => {
        const client = setupClient();
        client.loginWithOAuth({ project });
        mockRedirect.mockImplementationOnce(async () => {
          done();
        });
        client.authenticate();
      });

      test('onAuthenticate: REDIRECT', async done => {
        const client = setupClient();
        client.loginWithOAuth({
          project,
          onAuthenticate: REDIRECT,
        });
        mockRedirect.mockImplementationOnce(async () => {
          done();
        });
        await client.authenticate();
      });

      test('onAuthenticate: POPUP', async done => {
        const client = setupClient();
        client.loginWithOAuth({
          project,
          onAuthenticate: POPUP,
        });
        mockPopup.mockImplementationOnce(async () => {
          done();
          return {};
        });
        await client.authenticate();
      });

      test('should call onAuthenticate on 401', async () => {
        const onAuthenticate = jest.fn();
        const client = setupClient(mockBaseUrl);
        client.loginWithOAuth({
          project,
          onAuthenticate,
        });
        onAuthenticate.mockImplementation(login => {
          login.skip();
        });
        nock(mockBaseUrl)
          .get('/401')
          .once()
          .reply(401, {});
        await expect(
          client.get('/401')
        ).rejects.toThrowErrorMatchingInlineSnapshot(
          `"Request failed | status code: 401"`
        );
        expect(mockLoginSilently).toHaveBeenCalledTimes(1);
      });

      test('manually trigger authentication', async () => {
        const onAuthenticate = jest.fn().mockImplementationOnce(login => {
          login.skip();
        });
        const client = setupClient(mockBaseUrl);
        client.loginWithOAuth({
          project,
          onAuthenticate,
        });
        await expect(client.authenticate()).resolves.toBe(false);
        expect(mockLoginSilently).toHaveBeenCalledTimes(1);
      });

      test('handle error query params', async () => {
        const onAuthenticate = jest.fn();
        const client = setupClient(mockBaseUrl);
        client.loginWithOAuth({
          project,
          onAuthenticate,
        });
        const errorMessage = 'Failed login';
        mockLoginSilently.mockImplementationOnce(() => {
          throw Error(errorMessage);
        });
        await expect(client.authenticate()).rejects.toThrowError(errorMessage);
      });

      test('retry request after silent login', async () => {
        const onAuthenticate = jest.fn();
        const client = setupClient(mockBaseUrl);
        client.loginWithOAuth({
          project,
          onAuthenticate,
        });
        mockLoginSilently.mockReturnValueOnce(authTokens);
        nock(mockBaseUrl, { badheaders: [AUTHORIZATION_HEADER] })
          .get('/')
          .once()
          .reply(401, {});
        nock(mockBaseUrl, {
          reqheaders: {
            [AUTHORIZATION_HEADER]: bearerString(authTokens.accessToken),
          },
        })
          .get('/')
          .once()
          .reply(200, []);
        const response = await client.get('/');
        expect(response.data).toEqual([]);
      });

      test('dont call onAuthenticate twice when first call hasnt returned yet', async () => {
        const client = setupClient(mockBaseUrl);
        const onAuthenticate = jest.fn().mockImplementationOnce(async login => {
          await sleepPromise(100);
          login.skip();
        });
        client.loginWithOAuth({
          project,
          onAuthenticate,
        });
        nock(mockBaseUrl)
          .get('/401')
          .once()
          .reply(401);
        let promise401Throwed = false;
        client.get('/401').catch(() => {
          promise401Throwed = true;
        });
        const promiseAuthenticate = client.authenticate();
        await sleepPromise(200);
        expect(onAuthenticate).toBeCalledTimes(1);
        expect(promise401Throwed).toBe(true);
        await expect(promiseAuthenticate).resolves.toBe(false);
      });

      describe('cached access token', () => {
        test('should be able to provide an access token', async () => {
          const client = setupClient(mockBaseUrl);
          client.loginWithOAuth({
            project,
            accessToken: authTokens.accessToken,
          });
          nock(mockBaseUrl, {
            reqheaders: {
              [AUTHORIZATION_HEADER]: bearerString(authTokens.accessToken),
            },
          })
            .get('/')
            .once()
            .reply(200, {});
          await client.get('/');
        });

        test('re-authenticate on 401', async done => {
          const client = setupClient(mockBaseUrl);
          client.loginWithOAuth({
            project,
            accessToken: authTokens.accessToken,
            onAuthenticate: () => done(),
          });
          nock(mockBaseUrl)
            .get('/')
            .once()
            .reply(401, {});
          client.get('/');
        });
      });
    });
  });

  describe.only('api endpoints smoke test', () => {
    let client: CogniteClient;

    beforeEach(() => {
      nock.cleanAll();
      client = setupMockableClient();
      const emptyResponse = { items: [] };
      nock(mockBaseUrl)
        .post(/.*/)
        .times(Infinity)
        .reply(200, emptyResponse);
      nock(mockBaseUrl)
        .get(/.*/)
        .times(Infinity)
        .reply(200, emptyResponse);
      nock(mockBaseUrl)
        .put(/.*/)
        .once()
        .reply(200, emptyResponse);
    });

    test('call (some) endpoints with a null context', async () => {
      async function callApi(api: any) {
        return Promise.all([
          callEndpoint(api.create, []),
          callEndpoint(api.list, {}),
          callEndpoint(api.retrieve, []),
          callEndpoint(api.update, []),
          callEndpoint(api.search, []),
          callEndpoint(api.delete, []),
          callEndpoint(api.insert, []),
        ]);
      }

      async function callEndpoint(endpoint: (a: any[]) => any, param: any) {
        if (endpoint) {
          const mockFn = jest.fn();
          await endpoint
            .bind(null)(param)
            .catch(mockFn);
          expect(mockFn).not.toBeCalled();
        }
      }

      await Promise.all(
        [
          client.assets,
          client.apiKeys,
          client.assets,
          client.datapoints,
          client.events,
          client.files,
          client.files3D,
          client.groups,
          client.login,
          client.logout,
          client.models3D,
          client.projects,
          client.raw,
          client.securityCategories,
          client.serviceAccounts,
          client.timeseries,
          client.viewer3D,
        ].map(callApi)
      );
    });
  });
});
