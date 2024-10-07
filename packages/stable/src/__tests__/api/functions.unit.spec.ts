import nock from 'nock';
import { beforeEach, describe, expect, test } from 'vitest';
import { mockBaseUrl, setupMockableClient } from '../testUtils';

import type {
  Function as CogniteFunction,
  FunctionListResponse,
  FunctionsActivationResponse,
  FunctionsLimitsResponse,
} from '../../api/functions/types.gen';

describe('FunctionsAPI', () => {
  let client: CogniteClient;
  const mockFunction = {
    id: 1,
    createdTime: 123455234,
    status: 'Queued',
    name: 'myfunction',
    externalId: 'my.known.id',
    fileId: 1,
    owner: 'user@cognite.com',
    description: 'My fantastic function with advanced ML',
    metadata: {
      property1: 'string',
      property2: 'string',
    },
    secrets: {
      MySecret: '***',
    },
    functionPath: 'myfunction/handler.py',
    envVars: {
      MyKey: 'MyValue',
    },
    cpu: 1,
    memory: 1.5,
    runtime: 'py311',
    runtimeVersion: 'Python 3.8.13',
    error: {
      code: 400,
      message: 'Could not build function.',
    },
  } as CogniteFunction;
  beforeEach(() => {
    nock.cleanAll();
    client = setupMockableClient();
  });

  test('list', async () => {
    const mockResponse: FunctionListResponse = { items: [mockFunction] };
    nock(mockBaseUrl)
      .post(/\/functions\/list/, { limit: 100 })
      .once()
      .reply(200, mockResponse);

    const result = await client.functions.list({ limit: 100 });
    expect(result.data).toEqual(mockResponse);
  });

  test('filter', async () => {
    const mockResponse: FunctionListResponse = { items: [mockFunction] };
    nock(mockBaseUrl)
      .post(/\/functions\/list/, { filter: { name: 'test' } })
      .reply(200, mockResponse);

    const result = await client.functions.filter({ filter: { name: 'test' } });
    expect(result.data).toEqual(mockResponse);
  });

  test('retrieve', async () => {
    const mockResponse: FunctionListResponse = { items: [mockFunction] };
    nock(mockBaseUrl)
      .post(/\/functions\/byids/, { items: [{ id: '123' }] })
      .reply(200, mockResponse);

    const result = await client.functions.retrieve({ items: [{ id: '123' }] });
    expect(result.data).toEqual(mockResponse);
  });

  test('getById', async () => {
    const response: CogniteFunction = mockFunction;
    nock(mockBaseUrl)
      .get(/\/functions\/1/)
      .reply(200, response);

    const result = await client.functions.getById({ functionId: 1 });
    expect(result.data).toEqual(response);
  });

  test('status', async () => {
    const response: FunctionsActivationResponse = { status: 'activated' };
    nock(mockBaseUrl)
      .get(/\/functions\/status/)
      .reply(200, response);

    const result = await client.functions.status();
    expect(result.data).toEqual(response);
  });

  test('limits', async () => {
    const response: FunctionsLimitsResponse = {
      timeoutMinutes: 9,
      cpuCores: {
        min: 1,
        max: 1,
        default: 1,
      },
      memoryGb: {
        min: 1.5,
        max: 1.5,
        default: 1.5,
      },
      runtimes: ['py38', 'py39', 'py310', 'py311'],
      responseSizeMb: 1,
    };
    nock(mockBaseUrl)
      .get(/\/functions\/limits/)
      .reply(200, response);

    const result = await client.functions.limits();
    expect(result.data).toEqual(response);
  });

  test('activate', async () => {
    const response: FunctionsActivationResponse = { status: 'activated' };
    nock(mockBaseUrl)
      .post(/\/functions\/status/)
      .reply(200, response);

    const result = await client.functions.activate();
    expect(result.data).toEqual(response);
  });

  test('delete', async () => {
    nock(mockBaseUrl)
      .post(/\/functions\/delete/, { items: [{ id: 1 }] })
      .reply(200, {});

    const result = await client.functions.delete({ items: [{ id: 1 }] });
    expect(result.data).toEqual({});
  });

  test('call', async () => {
    const response = { status: 'success' };
    nock(mockBaseUrl)
      .post(/\/functions\/123\/call/, { data: {} })
      .reply(200, response);

    const result = await client.functions.call(123, { data: {} });
    expect(result.data).toEqual(response);
  });
});
