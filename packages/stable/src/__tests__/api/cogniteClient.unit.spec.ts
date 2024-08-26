// Copyright 2020 Cognite AS

import nock from 'nock';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import type CogniteClient from '../../cogniteClient';
import { mockBaseUrl, setupMockableClient } from '../testUtils';

describe('api endpoints smoke test', () => {
  let client: CogniteClient;

  beforeEach(() => {
    nock.cleanAll();
    client = setupMockableClient();
    const emptyResponse = { items: [] };
    nock(mockBaseUrl)
      .post(/.*/)
      .times(Number.POSITIVE_INFINITY)
      .reply(200, emptyResponse);
    nock(mockBaseUrl)
      .get(/.*/)
      .times(Number.POSITIVE_INFINITY)
      .reply(200, emptyResponse);
    nock(mockBaseUrl).put(/.*/).once().reply(200, emptyResponse);
  });

  test('call (some) endpoints with a null context', async () => {
    type API = {
      create?: (param: unknown[]) => Promise<unknown[]>;
      list?: () => Promise<unknown>;
      retrieve?: () => Promise<unknown>;
      update?: () => Promise<unknown>;
      search?: () => Promise<unknown>;
      delete?: () => Promise<unknown>;
      insert?: () => Promise<unknown>;
    };
    async function callApi(api: API) {
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

    async function callEndpoint<T>(
      endpoint: ((a: T) => Promise<T>) | undefined,
      param: T
    ) {
      if (endpoint) {
        const mockFn = vi.fn();
        await endpoint.bind(null)(param).catch(mockFn);
        expect(mockFn).not.toBeCalled();
      }
    }

    await Promise.all(
      [
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
        // @ts-ignore
      ].map(callApi)
    );
  });
});
