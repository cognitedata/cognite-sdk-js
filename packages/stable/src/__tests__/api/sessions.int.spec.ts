import type { SessionFilter } from 'stable/src/api/sessions/types';
import { beforeAll, describe, expect, test } from 'vitest';
import type CogniteClient from '../../cogniteClient';
import { setupLoggedInClient } from '../testUtils';

describe('Sessions integration test', () => {
  let testSessionId: number | undefined = undefined;
  let client: CogniteClient;

  beforeAll(async () => {
    client = setupLoggedInClient();
  });

  test('create', async () => {
    const clientSecret = process.env.COGNITE_CLIENT_SECRET || '';
    const clientId = process.env.COGNITE_CLIENT_ID || '';
    expect(clientSecret).toBeTruthy();
    expect(clientId).toBeTruthy();
    const result = await client.sessions.create([
      {
        clientSecret,
        clientId,
      },
    ]);

    expect(result).toHaveLength(1);
    expect(typeof result[0].id).toBe('number');
    testSessionId = result[0].id;

    expect(result[0].status).toBe('READY');
    expect(typeof result[0].nonce).toBe('string');
    expect(result[0].type).toBe('CLIENT_CREDENTIALS');
    expect(result[0].clientId).toBe(clientId);
  });

  test('list', async () => {
    expect(testSessionId).toBeTruthy();
    const filter: SessionFilter = { status: 'READY' };
    const items = await client.sessions.list({ filter }).autoPagingToArray();

    expect(items.length).toBeGreaterThan(0);
    const foundSession = items.find((session) => session.id === testSessionId);
    expect(foundSession).toBeDefined();
    expect(foundSession?.creationTime).toBeLessThan(Date.now());
    expect(foundSession?.expirationTime).toBeGreaterThan(Date.now());
  });

  test('retrieve', async () => {
    expect(testSessionId).toBeTruthy();
    if (testSessionId === undefined) {
      throw new Error('testSessionId is undefined');
    }
    const result = await client.sessions.retrieve([{ id: testSessionId }]);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(testSessionId);
  });

  test('revoke', async () => {
    expect(testSessionId).toBeTruthy();
    if (testSessionId === undefined) {
      throw new Error('testSessionId is undefined');
    }
    const result = await client.sessions.revoke([{ id: testSessionId }]);
    expect(result).toHaveLength(1);
    expect(result[0].status).toBe('REVOKED');
  });
});
