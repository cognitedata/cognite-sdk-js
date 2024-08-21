// Copyright 2020 Cognite AS

import nock from 'nock';
import { beforeEach, describe, expect, test } from 'vitest';
import { setupMockableClient, mockBaseUrl } from '../testUtils';

describe('Files unit test', () => {
  let client: CogniteClient;
  beforeEach(() => {
    client = setupMockableClient();
    nock.cleanAll();
  });

  test('filter with directoryPrefix', async () => {
    nock(mockBaseUrl)
      .post(new RegExp('/files/list'), {
        filter: {
          directoryPrefix: '/test',
        },
      })
      .once()
      .reply(200, {
        items: [
          {
            id: 928734,
            name: 'some_name',
            uploaded: false,
            createdTime: 93795847835,
            lastUpdatedTime: 93795847835,
            directory: '/test/functional',
          },
        ],
      });

    const resp = await client.files.list({
      filter: {
        directoryPrefix: '/test',
      },
    });

    expect(resp.items.length).toEqual(1);
    expect(resp.items[0].directory).toContain('/test');
  });
});
