// Copyright 2026 Cognite AS

import nock from 'nock';
import { beforeEach, describe, expect, test } from 'vitest';
import type CogniteClient from '../../cogniteClient';
import type {
  TransformationSchedule,
  TransformationScheduleChange,
  TransformationScheduleCreate,
} from '../../types';
import { mockBaseUrl, setupMockableClient } from '../testUtils';

describe('Transformation schedules unit test', () => {
  let client: CogniteClient;

  const scheduleCreate = {
    externalId: 'my-transformation',
    interval: '0 * * * *',
    isPaused: false,
  } satisfies TransformationScheduleCreate;

  const schedule: TransformationSchedule = {
    id: 1,
    externalId: 'my-transformation',
    createdTime: 1730000000000,
    lastUpdatedTime: 1730000001000,
    interval: '0 * * * *',
    isPaused: false,
  };

  beforeEach(() => {
    client = setupMockableClient();
    nock.cleanAll();
  });

  test('create', async () => {
    nock(mockBaseUrl)
      .post(/\/transformations\/schedules$/, { items: [scheduleCreate] })
      .once()
      .reply(201, { items: [schedule] });

    const created = await client.transformations.schedules.create([
      scheduleCreate,
    ]);
    expect(created).toEqual([schedule]);
  });

  test('list', async () => {
    nock(mockBaseUrl)
      .get(/\/transformations\/schedules\/?$/)
      .query({ limit: '10', includePublic: 'false' })
      .once()
      .reply(200, { items: [schedule], nextCursor: 'next' });

    const response = await client.transformations.schedules.list({
      limit: 10,
      includePublic: false,
    });
    expect({
      items: response.items,
      nextCursor: response.nextCursor,
    }).toEqual({ items: [schedule], nextCursor: 'next' });
  });

  test('retrieve', async () => {
    nock(mockBaseUrl)
      .post(/\/transformations\/schedules\/byids$/, {
        items: [{ id: 1 }, { externalId: 'my-transformation' }],
        ignoreUnknownIds: true,
      })
      .once()
      .reply(200, { items: [schedule] });

    const retrieved = await client.transformations.schedules.retrieve(
      [{ id: 1 }, { externalId: 'my-transformation' }],
      { ignoreUnknownIds: true }
    );
    expect(retrieved).toEqual([schedule]);
  });

  test('update', async () => {
    const change = {
      id: 1,
      update: { interval: { set: '*/5 * * * *' }, isPaused: { set: true } },
    } satisfies TransformationScheduleChange;
    const updated = { ...schedule, interval: '*/5 * * * *', isPaused: true };
    nock(mockBaseUrl)
      .post(/\/transformations\/schedules\/update$/, { items: [change] })
      .once()
      .reply(200, { items: [updated] });

    const response = await client.transformations.schedules.update([change]);
    expect(response).toEqual([updated]);
  });

  test('delete', async () => {
    nock(mockBaseUrl)
      .post(/\/transformations\/schedules\/delete$/, {
        items: [{ externalId: 'my-transformation' }],
        ignoreUnknownIds: true,
      })
      .once()
      .reply(200, {});

    const response = await client.transformations.schedules.delete(
      [{ externalId: 'my-transformation' }],
      { ignoreUnknownIds: true }
    );
    expect(response).toEqual({});
  });
});
