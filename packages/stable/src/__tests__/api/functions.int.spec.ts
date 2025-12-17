// Copyright 2020 Cognite AS

import { beforeAll, describe, expect, test } from 'vitest';
import type CogniteClient from '../../cogniteClient';
import { setupLoggedInClient } from '../testUtils';

describe('Functions integration test', () => {
  let client: CogniteClient;

  beforeAll(async () => {
    client = setupLoggedInClient();
  });

  test('status', async () => {
    const response = await client.functions.status();
    expect(response.status).toBeDefined();
    expect(['inactive', 'requested', 'activated']).toContain(response.status);
  });

  test('limits', async () => {
    const limits = await client.functions.limits();
    expect(limits.timeoutMinutes).toBeGreaterThan(0);
    expect(limits.runtimes).toBeDefined();
    expect(Array.isArray(limits.runtimes)).toBe(true);
    expect(limits.cpuCores).toBeDefined();
    expect(limits.memoryGb).toBeDefined();
  });

  test('list', async () => {
    const functions = await client.functions.list({ limit: 10 });
    expect(Array.isArray(functions)).toBe(true);
  });
});

