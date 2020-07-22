// Copyright 2020 Cognite AS

import nock from 'nock';
import CogniteClient from '../cogniteClient';
import { Asset, ItemsWrapper } from '../types';
import {
  mockBaseUrl,
  setupLoggedInClient,
  setupMockableClient,
} from './testUtils';

describe('createClientWithApiKey - integration', () => {
  test('handle non-exisiting api-key', async () => {
    const client = new CogniteClient({
      appId: 'JS Integration test',
    });
    client.loginWithApiKey({
      project: 'cognitesdk-js',
      apiKey: 'non-exisiting-api-key',
    });
    await expect(
      client.assets.list({ limit: 1 }).autoPagingToArray({ limit: 1 })
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `"Request failed | status code: 401"`
    );
  });
});

describe('http methods - integration', () => {
  let client: CogniteClient;
  beforeAll(async () => {
    client = setupLoggedInClient();
  });
  test('post method', async () => {
    const assets = [{ name: 'First asset' }, { name: 'Second asset' }];
    const response = await client.post<ItemsWrapper<Asset[]>>(
      '/api/v1/projects/cognitesdk-js/assets',
      { data: { items: assets } }
    );
    expect(response.data.items).toHaveLength(2);
  });
  test('get method', async () => {
    const response = await client.get('/api/v1/projects/cognitesdk-js/assets');
    expect(response.data).toHaveProperty('items');
  });
});

describe('api endpoints smoke test', () => {
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
