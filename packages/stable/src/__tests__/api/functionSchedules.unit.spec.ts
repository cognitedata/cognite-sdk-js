// Copyright 2026 Cognite AS

import nock from 'nock';
import { beforeEach, describe, expect, test } from 'vitest';
import type CogniteClient from '../../cogniteClient';
import type {
  FunctionSchedule,
  FunctionScheduleCreate,
  FunctionScheduleInputData,
  FunctionScheduleListQuery,
} from '../../types';
import { mockBaseUrl, setupMockableClient } from '../testUtils';

describe('Function schedules unit test', () => {
  let client: CogniteClient;

  const schedule: FunctionSchedule = {
    id: 1,
    name: 'Daily run',
    createdTime: 1730000000000,
    description: 'Runs every day at 04:05',
    cronExpression: '5 4 * * *',
    when: 'At 04:05 AM',
    functionId: 123,
    sessionId: 456,
  };

  beforeEach(() => {
    client = setupMockableClient();
    nock.cleanAll();
  });

  const scheduleCreate = {
    name: schedule.name,
    description: schedule.description,
    cronExpression: schedule.cronExpression,
    functionId: schedule.functionId,
    data: { assetId: 42 },
    nonce: 'nonce-1',
  } satisfies FunctionScheduleCreate;

  test('create', async () => {
    nock(mockBaseUrl)
      .post(/\/functions\/schedules\/?$/, { items: [scheduleCreate] })
      .once()
      .reply(201, { items: [schedule] });

    const created = await client.functions.schedules.create([scheduleCreate]);
    expect(created).toEqual([schedule]);
  });

  test('create sends one request per item, in order', async () => {
    const second = { ...scheduleCreate, name: 'Second', nonce: 'nonce-2' };
    const createdSecond = { ...schedule, id: 2, name: 'Second' };
    nock(mockBaseUrl)
      .post(/\/functions\/schedules\/?$/, { items: [scheduleCreate] })
      .once()
      .reply(201, { items: [schedule] })
      .post(/\/functions\/schedules\/?$/, { items: [second] })
      .once()
      .reply(201, { items: [createdSecond] });

    const created = await client.functions.schedules.create([
      scheduleCreate,
      second,
    ]);
    expect(created).toEqual([schedule, createdSecond]);
  });

  test('delete', async () => {
    nock(mockBaseUrl)
      .post(/\/functions\/schedules\/delete$/, { items: [{ id: 1 }] })
      .once()
      .reply(200, {});

    const response = await client.functions.schedules.delete([{ id: 1 }]);
    expect(response).toEqual({});
  });

  test('list', async () => {
    const query = {
      filter: {
        functionId: 123,
        createdTime: { min: 1720000000000 },
        cronExpression: '5 4 * * *',
      },
      limit: 10,
    } satisfies FunctionScheduleListQuery;
    nock(mockBaseUrl)
      .post(/\/functions\/schedules\/list$/, query)
      .once()
      .reply(200, { items: [schedule] });

    const schedules = await client.functions.schedules.list(query);
    expect(schedules).toEqual([schedule]);
  });

  test('list sends an empty body without a query', async () => {
    nock(mockBaseUrl)
      .post(/\/functions\/schedules\/list$/, {})
      .once()
      .reply(200, { items: [schedule] });

    const schedules = await client.functions.schedules.list();
    expect(schedules).toEqual([schedule]);
  });

  test('list is retried on server errors', async () => {
    nock(mockBaseUrl)
      .post(/\/functions\/schedules\/list$/)
      .once()
      .reply(503, {})
      .post(/\/functions\/schedules\/list$/)
      .once()
      .reply(200, { items: [schedule] });

    const schedules = await client.functions.schedules.list();
    expect(schedules).toEqual([schedule]);
  });

  test('retrieve', async () => {
    nock(mockBaseUrl)
      .post(/\/functions\/schedules\/byids$/, {
        items: [{ id: 1 }],
        ignoreUnknownIds: true,
      })
      .once()
      .reply(200, { items: [schedule] });

    const schedules = await client.functions.schedules.retrieve([{ id: 1 }], {
      ignoreUnknownIds: true,
    });
    expect(schedules).toEqual([schedule]);
  });

  test('retrieve is retried on server errors', async () => {
    nock(mockBaseUrl)
      .post(/\/functions\/schedules\/byids$/)
      .once()
      .reply(503, {})
      .post(/\/functions\/schedules\/byids$/, { items: [{ id: 1 }] })
      .once()
      .reply(200, { items: [schedule] });

    const schedules = await client.functions.schedules.retrieve([{ id: 1 }]);
    expect(schedules).toEqual([schedule]);
  });

  test('getInputData', async () => {
    const inputData: FunctionScheduleInputData = {
      id: 1,
      data: { assetId: 42 },
    };
    nock(mockBaseUrl)
      .get(/\/functions\/schedules\/1\/input_data$/)
      .once()
      .reply(200, inputData);

    const response = await client.functions.schedules.getInputData(1);
    expect(response).toEqual(inputData);
  });
});
