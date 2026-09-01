// Copyright 2026 Cognite AS

import nock from 'nock';
import { beforeEach, describe, expect, test } from 'vitest';
import type { CogniteClient } from '../..';
import { mockBaseUrl, setupMockableClient } from '../testUtils';

const CHUNK_SIZE = 1000;
const ITEM_COUNT = 1500;

const subscriptionIds = Array.from({ length: ITEM_COUNT }, (_, i) => ({
  externalId: `sub_${i}`,
}));

function subscriptionItems(offset: number, count: number) {
  return Array.from({ length: count }, (_, i) => ({
    externalId: `sub_${offset + i}`,
    partitionCount: 1,
    createdTime: new Date(),
    lastUpdatedTime: new Date(),
  }));
}

function mockChunkedPost(
  path: RegExp,
  reply: (offset: number, count: number) => object,
  matchBody?: (length: number) => (body: { items: unknown[] }) => boolean
) {
  const match =
    matchBody ??
    ((length: number) => (body: { items: unknown[] }) =>
      body.items.length === length);
  return [
    nock(mockBaseUrl)
      .post(path, match(CHUNK_SIZE))
      .once()
      .reply(200, reply(0, CHUNK_SIZE)),
    nock(mockBaseUrl)
      .post(path, match(ITEM_COUNT - CHUNK_SIZE))
      .once()
      .reply(200, reply(CHUNK_SIZE, ITEM_COUNT - CHUNK_SIZE)),
  ];
}

describe('Data point subscriptions unit test', () => {
  let client: CogniteClient;

  beforeEach(() => {
    client = setupMockableClient();
    nock.cleanAll();
  });

  test.each([
    {
      label: 'create',
      path: /\/timeseries\/subscriptions$/,
      run: () =>
        client.timeseries.subscriptions.create(
          subscriptionIds.map(({ externalId }) => ({
            externalId,
            partitionCount: 1,
            timeSeriesIds: ['ts_1'],
          }))
        ),
      reply: (offset: number, count: number) => ({
        items: subscriptionItems(offset, count),
      }),
    },
    {
      label: 'retrieve',
      path: /\/timeseries\/subscriptions\/byids/,
      run: () =>
        client.timeseries.subscriptions.retrieve({ items: subscriptionIds }),
      reply: (offset: number, count: number) => ({
        items: subscriptionItems(offset, count),
      }),
    },
    {
      label: 'update',
      path: /\/timeseries\/subscriptions\/update/,
      run: () =>
        client.timeseries.subscriptions.update(
          subscriptionIds.map(({ externalId }) => ({
            externalId,
            update: { name: { set: externalId } },
          }))
        ),
      reply: (offset: number, count: number) => ({
        items: subscriptionItems(offset, count),
      }),
    },
    {
      label: 'delete',
      path: /\/timeseries\/subscriptions\/delete/,
      run: () =>
        client.timeseries.subscriptions.delete({
          items: subscriptionIds,
          ignoreUnknownIds: true,
        }),
      reply: () => ({}),
      matchBody:
        (length: number) =>
        (body: { items: unknown[]; ignoreUnknownIds?: boolean }) =>
          body.items.length === length && body.ignoreUnknownIds === true,
    },
  ])(
    '$label sends two chunked requests (1000 + 500 items)',
    async ({ path, run, reply, matchBody }) => {
      const scopes = mockChunkedPost(path, reply, matchBody);
      const result = await run();
      expect(scopes.every((scope) => scope.isDone())).toBe(true);
      if (result) {
        expect(result).toHaveLength(ITEM_COUNT);
      }
    }
  );
});
