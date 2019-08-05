// Copyright 2019 Cognite AS

import MockAdapter from 'axios-mock-adapter';
import CogniteClient, { POPUP, REDIRECT } from '../cogniteClient';
import * as Login from '../resources/login';
import { sleepPromise } from '../utils';
import { apiKey, authTokens, project, setupClient } from './testUtils';

// tslint:disable-next-line:no-big-function
describe('CogniteClient', () => {
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
      expect.assertions(1);
      const client = setupClient();
      client.loginWithApiKey({
        project,
        apiKey,
      });
      const axiosMock = new MockAdapter(client.instance);
      axiosMock.onGet('/test').replyOnce(config => {
        expect(config.headers['api-key']).toBe(apiKey);
        return [200];
      });
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
    let mock: MockAdapter;
    let client: CogniteClient;

    beforeAll(async () => {
      client = setupClient();
      mock = new MockAdapter(client.instance);
    });
    beforeEach(async () => {
      mock.reset();
    });

    test('get method', async () => {
      mock.onGet('/').replyOnce(200, 'test');
      const response = await client.get('/');
      expect(response.data).toEqual('test');
    });

    test('post method', async () => {
      mock.onPost('/').replyOnce(200, 'test');
      const response = await client.post('/');
      expect(response.data).toEqual('test');
    });

    test('put method', async () => {
      mock.onPut('/').replyOnce(200, 'test');
      const response = await client.put('/');
      expect(response.data).toEqual('test');
    });

    test('delete method', async () => {
      mock.onDelete('/').replyOnce(200, 'test');
      const response = await client.delete('/');
      expect(response.data).toEqual('test');
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
        const client = setupClient();
        const axiosMock = new MockAdapter(client.instance);
        client.loginWithOAuth({
          project,
          onAuthenticate,
        });
        onAuthenticate.mockImplementation(login => {
          login.skip();
        });
        axiosMock.onGet('/401').replyOnce(401);
        await expect(
          client.get('/401')
        ).rejects.toThrowErrorMatchingInlineSnapshot(
          `"Request failed with status code 401"`
        );
        expect(mockLoginSilently).toHaveBeenCalledTimes(1);
      });

      test('manually trigger authentication', async () => {
        const onAuthenticate = jest.fn().mockImplementationOnce(login => {
          login.skip();
        });
        const client = setupClient();
        client.loginWithOAuth({
          project,
          onAuthenticate,
        });
        await expect(client.authenticate()).resolves.toBe(false);
        expect(mockLoginSilently).toHaveBeenCalledTimes(1);
      });

      test('handle error query params', async () => {
        const onAuthenticate = jest.fn();
        const client = setupClient();
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
        const client = setupClient();
        const axiosMock = new MockAdapter(client.instance);
        client.loginWithOAuth({
          project,
          onAuthenticate,
        });
        mockLoginSilently.mockReturnValueOnce(authTokens);
        expect.assertions(3);
        axiosMock.onGet('/').replyOnce(config => {
          expect(config.headers.Authorization).not.toBeDefined();
          return [401];
        });
        const body = 'hello';
        axiosMock.onGet('/').replyOnce(config => {
          expect(config.headers.Authorization).toBe(
            `Bearer ${authTokens.accessToken}`
          );
          return [200, body];
        });
        const response = await client.get('/');
        expect(response.data).toBe(body);
      });

      test('dont call onAuthenticate twice when first call hasnt returned yet', async () => {
        const client = setupClient();
        const axiosMock = new MockAdapter(client.instance);
        const onAuthenticate = jest.fn().mockImplementationOnce(async login => {
          await sleepPromise(100);
          login.skip();
        });
        client.loginWithOAuth({
          project,
          onAuthenticate,
        });
        axiosMock.onGet('/401').replyOnce(401);
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

      test(
        'handle 401 from /login/status when authenticating',
        async () => {
          const client = setupClient();
          const axiosMock = new MockAdapter(client.instance);
          const onAuthenticate = jest.fn();
          client.loginWithOAuth({
            project,
            onAuthenticate,
          });
          expect.assertions(1);
          mockLoginSilently.mockImplementationOnce(async () => {
            await expect(
              Login.getIdInfoFromAccessToken(
                client.instance,
                authTokens.accessToken
              )
            ).resolves.toBeNull();
            return authTokens;
          });
          axiosMock.onGet('/').replyOnce(401);
          axiosMock
            .onGet('/login/status')
            .replyOnce(401, { error: { code: 401, message: 'Unauthorized' } });
          axiosMock.onGet('/').reply(200);
          await client.get('/');
        },
        500
      );
    });
  });
});
