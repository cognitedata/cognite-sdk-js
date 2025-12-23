// Copyright 2025 Cognite AS

import matches from 'lodash/matches';
import nock from 'nock';
import { beforeEach, describe, expect, test } from 'vitest';
import type { CogniteClient, ExternalCogniteFunctionItem } from '../..';
import { mockBaseUrl, setupMockableClient } from '../testUtils';

describe('Functions unit test', () => {
  let client: CogniteClient;

  const externalFunction: ExternalCogniteFunctionItem = {
    name: 'My awesome function',
    fileId: 5467347282343,
    description: 'Test function',
  };

  const mockFunction = {
    id: 123,
    name: externalFunction.name,
    fileId: externalFunction.fileId,
    description: externalFunction.description,
    status: 'Ready',
    createdTime: Date.now(),
  };

  beforeEach(() => {
    client = setupMockableClient();
    nock.cleanAll();
  });

  test('create', async () => {
    nock(mockBaseUrl)
      .post(
        /\/functions$/,
        matches({
          items: [externalFunction],
        })
      )
      .once()
      .reply(201, {
        items: [mockFunction],
      });

    const createdFunctions = await client.functions.create([externalFunction]);
    expect(createdFunctions[0].id).toBe(mockFunction.id);
    expect(createdFunctions[0].name).toBe(externalFunction.name);
  });

  test('list', async () => {
    nock(mockBaseUrl)
      .post(/\/functions\/list/, {
        filter: { status: 'Ready' },
        limit: 10,
      })
      .once()
      .reply(200, {
        items: [mockFunction],
      });

    const functions = await client.functions.list({
      filter: { status: 'Ready' },
      limit: 10,
    });
    expect(functions.length).toBe(1);
    expect(functions[0].id).toBe(mockFunction.id);
  });

  test('retrieve by id', async () => {
    nock(mockBaseUrl)
      .get(/\/functions\/123/)
      .once()
      .reply(200, mockFunction);

    const func = await client.functions.retrieve([{ id: 123 }]);
    expect(func[0].id).toBe(mockFunction.id);
    expect(func[0].name).toBe(mockFunction.name);
  });

  test('delete', async () => {
    nock(mockBaseUrl)
      .post(/\/functions\/delete/, {
        items: [{ id: 123 }],
      })
      .once()
      .reply(200, {});

    await client.functions.delete([{ id: 123 }]);
  });

  test('limits', async () => {
    const mockLimits = {
      timeoutMinutes: 15,
      cpuCores: { min: 0.1, max: 2, default: 0.25 },
      memoryGb: { min: 0.1, max: 4, default: 1 },
      runtimes: ['py310', 'py311', 'py312'],
      responseSizeMb: 1,
    };

    nock(mockBaseUrl)
      .get(/\/functions\/limits/)
      .once()
      .reply(200, mockLimits);

    const limits = await client.functions.limits();
    expect(limits.timeoutMinutes).toBe(15);
    expect(limits.runtimes).toContain('py312');
  });

  test('activate', async () => {
    nock(mockBaseUrl)
      .post(/\/functions\/status/)
      .once()
      .reply(202, { status: 'requested' });

    const response = await client.functions.activate();
    expect(response.status).toBe('requested');
  });

  test('status', async () => {
    nock(mockBaseUrl)
      .get(/\/functions\/status/)
      .once()
      .reply(200, { status: 'activated' });

    const response = await client.functions.status();
    expect(response.status).toBe('activated');
  });
});
