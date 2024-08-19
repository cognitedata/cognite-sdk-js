// Copyright 2020 Cognite AS

import nock from 'nock';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { mockBaseUrl, setupMockableClient } from '../testUtils';

describe('api endpoints smoke test', () => {
  let client: CogniteClient;

  beforeEach(() => {
    nock.cleanAll();
    client = setupMockableClient();
    const emptyResponse = { items: [] };
    nock(mockBaseUrl).post(/.*/).times(Infinity).reply(200, emptyResponse);
    nock(mockBaseUrl).get(/.*/).times(Infinity).reply(200, emptyResponse);
    nock(mockBaseUrl).put(/.*/).once().reply(200, emptyResponse);
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
        const mockFn = vi.fn();
        await endpoint.bind(null)(param).catch(mockFn);
        expect(mockFn).not.toBeCalled();
      }
    }

    await Promise.all(
      [
        client.assets,
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
        client.timeseries,
        client.viewer3D,
      ].map(callApi)
    );
  });
});
