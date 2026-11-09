// Copyright 2026 Cognite AS

import nock from 'nock';
import { beforeEach, describe, expect, test } from 'vitest';
import type CogniteClient from '../../cogniteClient';
import type {
  FunctionCall,
  FunctionCallFilterQuery,
  FunctionCallLogEntry,
  FunctionCallRequest,
  FunctionCallResponse,
} from '../../types';
import { mockBaseUrl, setupMockableClient } from '../testUtils';

describe('Function calls unit test', () => {
  let client: CogniteClient;

  const functionCall: FunctionCall = {
    id: 456,
    status: 'Completed',
    startTime: 1730000000000,
    endTime: 1730000001000,
    functionId: 123,
  };

  beforeEach(() => {
    client = setupMockableClient();
    nock.cleanAll();
  });

  test('call', async () => {
    const request = {
      nonce: 'session-nonce',
      data: { assetId: 789 },
    } satisfies FunctionCallRequest;
    const runningCall: FunctionCall = {
      id: 456,
      status: 'Running',
      startTime: 1730000000000,
      functionId: 123,
    };
    nock(mockBaseUrl)
      .post(/\/functions\/123\/call$/, request)
      .once()
      .reply(201, runningCall);

    const call = await client.functions.call(123, request);
    expect(call).toEqual(runningCall);
  });

  test('call is not retried on server errors', async () => {
    nock(mockBaseUrl)
      .post(/\/functions\/123\/call$/)
      .once()
      .reply(503, {})
      .post(/\/functions\/123\/call$/)
      .once()
      .reply(201, functionCall);

    await expect(
      client.functions.call(123, { nonce: 'session-nonce' })
    ).rejects.toMatchObject({ status: 503 });
    expect(nock.pendingMocks()).toHaveLength(1);
  });

  test('list', async () => {
    const query = {
      filter: {
        status: 'Completed',
        startTime: { min: 1730000000000 },
      },
      limit: 10,
    } satisfies FunctionCallFilterQuery;
    nock(mockBaseUrl)
      .post(/\/functions\/123\/calls\/list$/, query)
      .once()
      .reply(200, { items: [functionCall], nextCursor: 'next' });

    const response = await client.functions.calls.list(123, query);
    expect({
      items: response.items,
      nextCursor: response.nextCursor,
    }).toEqual({ items: [functionCall], nextCursor: 'next' });
  });

  test('list without a query sends an empty body', async () => {
    nock(mockBaseUrl)
      .post(/\/functions\/123\/calls\/list$/, {})
      .once()
      .reply(200, { items: [functionCall] });

    const response = await client.functions.calls.list(123);
    expect(response.items).toEqual([functionCall]);
  });

  test('list is retried on server errors', async () => {
    nock(mockBaseUrl)
      .post(/\/functions\/123\/calls\/list$/)
      .once()
      .reply(503, {})
      .post(/\/functions\/123\/calls\/list$/)
      .once()
      .reply(200, { items: [functionCall] });

    const response = await client.functions.calls.list(123);
    expect(response.items).toEqual([functionCall]);
  });

  test('retrieve', async () => {
    nock(mockBaseUrl)
      .post(/\/functions\/123\/calls\/byids$/, {
        items: [{ id: 456 }],
        ignoreUnknownIds: true,
      })
      .once()
      .reply(200, { items: [functionCall] });

    const calls = await client.functions.calls.retrieve(123, [{ id: 456 }], {
      ignoreUnknownIds: true,
    });
    expect(calls).toEqual([functionCall]);
  });

  test('retrieve is retried on server errors', async () => {
    nock(mockBaseUrl)
      .post(/\/functions\/123\/calls\/byids$/)
      .once()
      .reply(502, {})
      .post(/\/functions\/123\/calls\/byids$/, { items: [{ id: 456 }] })
      .once()
      .reply(200, { items: [functionCall] });

    const calls = await client.functions.calls.retrieve(123, [{ id: 456 }]);
    expect(calls).toEqual([functionCall]);
  });

  test('getResponse', async () => {
    const callResponse: FunctionCallResponse = {
      response: { result: 42 },
      functionId: 123,
      callId: 456,
    };
    nock(mockBaseUrl)
      .get(/\/functions\/123\/calls\/456\/response$/)
      .once()
      .reply(200, callResponse);

    const response = await client.functions.calls.getResponse(123, 456);
    expect(response).toEqual(callResponse);
  });

  test('getLogs', async () => {
    const logs: FunctionCallLogEntry[] = [
      { timestamp: 1730000000500, message: 'Hello from the function' },
    ];
    nock(mockBaseUrl)
      .get(/\/functions\/123\/calls\/456\/logs$/)
      .once()
      .reply(200, { items: logs });

    const response = await client.functions.calls.getLogs(123, 456);
    expect(response).toEqual(logs);
  });
});
