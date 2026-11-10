// Copyright 2020 Cognite AS

import nock from 'nock';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import type CogniteClient from '../../cogniteClient';
import { mockBaseUrl, setupMockableClient } from '../testUtils';

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
      vi.useFakeTimers({ toFake: ['setTimeout'] });
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

    afterEach(() => {
      vi.useRealTimers();
    });

    async function runToCompletion<T>(start: () => Promise<T>) {
      const sleeps: number[] = [];
      const setTimeoutSpy = vi.spyOn(globalThis, 'setTimeout');
      let settled = false;
      const result = start().finally(() => {
        settled = true;
      });
      result.catch(() => {});
      while (!settled) {
        await vi.runAllTimersAsync();
      }
      for (const [, delay] of setTimeoutSpy.mock.calls) {
        if (typeof delay === 'number' && delay >= 1000) {
          sleeps.push(delay);
        }
      }
      return { result, sleeps };
    }

    test('polls with increasing delays until the file is uploaded', async () => {
      const byIds = nock(mockBaseUrl)
        .post(/\/files\/byids/)
        .times(3)
        .reply(200, fileResponse(false))
        .post(/\/files\/byids/)
        .once()
        .reply(200, fileResponse(true));

      const { result, sleeps } = await runToCompletion(() =>
        client.files.upload({ name: 'file' }, 'content', false, true)
      );

      expect({
        uploaded: (await result).uploaded,
        sleeps,
        done: byIds.isDone(),
      }).toEqual({ uploaded: true, sleeps: [1000, 1500, 2250], done: true });
    });

    test('gives up after 10 attempts with delays capped at 10s', async () => {
      const byIds = nock(mockBaseUrl)
        .post(/\/files\/byids/)
        .times(10)
        .reply(200, fileResponse(false));

      const { result, sleeps } = await runToCompletion(() =>
        client.files.upload({ name: 'file' }, 'content', false, true)
      );

      await expect(result).rejects.toThrow("File never marked as 'uploaded'");
      expect({ sleeps, done: byIds.isDone() }).toEqual({
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
