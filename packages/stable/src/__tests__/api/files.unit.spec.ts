// Copyright 2020 Cognite AS

import { sleepPromise } from '@cognite/sdk-core';
import nock from 'nock';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import type CogniteClient from '../../cogniteClient';
import { mockBaseUrl, setupMockableClient } from '../testUtils';

vi.mock('@cognite/sdk-core', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@cognite/sdk-core')>()),
  sleepPromise: vi.fn(async () => {}),
}));

describe('Files unit test', () => {
  let client: CogniteClient;
  beforeEach(() => {
    client = setupMockableClient();
    nock.cleanAll();
  });

  describe('upload with waitUntilAcknowledged', () => {
    const fileId = 123;
    const fileResponse = (uploaded: boolean) => ({
      items: [
        {
          id: fileId,
          name: 'file',
          uploaded,
          createdTime: 0,
          lastUpdatedTime: 0,
        },
      ],
    });

    beforeEach(() => {
      vi.mocked(sleepPromise).mockClear();
      nock(mockBaseUrl)
        .post(/\/files\/$/)
        .query(true)
        .once()
        .reply(200, {
          id: fileId,
          name: 'file',
          uploaded: false,
          uploadUrl: `${mockBaseUrl}/upload`,
          createdTime: 0,
          lastUpdatedTime: 0,
        });
      nock(mockBaseUrl).put('/upload').once().reply(200);
    });

    const sleeps = () =>
      vi.mocked(sleepPromise).mock.calls.map(([delay]) => delay);

    test('polls with increasing delays until the file is uploaded', async () => {
      const byIds = nock(mockBaseUrl)
        .post(/\/files\/byids/)
        .times(3)
        .reply(200, fileResponse(false))
        .post(/\/files\/byids/)
        .once()
        .reply(200, fileResponse(true));

      const result = await client.files.upload(
        { name: 'file' },
        'content',
        false,
        true
      );

      expect({
        uploaded: result.uploaded,
        sleeps: sleeps(),
        done: byIds.isDone(),
      }).toEqual({ uploaded: true, sleeps: [1000, 1500, 2250], done: true });
    });

    test('gives up after 10 attempts with delays capped at 10s', async () => {
      const byIds = nock(mockBaseUrl)
        .post(/\/files\/byids/)
        .times(10)
        .reply(200, fileResponse(false));

      await expect(
        client.files.upload({ name: 'file' }, 'content', false, true)
      ).rejects.toThrow("File never marked as 'uploaded'");
      expect({ sleeps: sleeps(), done: byIds.isDone() }).toEqual({
        sleeps: [1000, 1500, 2250, 3375, 5062.5, 7593.75, 10000, 10000, 10000],
        done: true,
      });
    });
  });

  test('filter with directoryPrefix', async () => {
    nock(mockBaseUrl)
      .post(/\/files\/list/, {
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
