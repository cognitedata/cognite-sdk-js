// Copyright 2020 Cognite AS

import CogniteClient from '../../../cogniteClient';
import { setupClient, setupLoggedInClientWithOidc } from '../../testUtils';

describe.skip('Login-api integration test', () => {
  let client: CogniteClient;
  beforeAll(async () => {
    client = setupLoggedInClientWithOidc();
    await client.authenticate();
  });

  describe('status', () => {
    test('logged in', async () => {
      await client.authenticate();
      const status = await client.login.status();
      expect(status).toBeDefined();
      expect(status!.project).toBeDefined();
      expect(status!.user).toBeDefined();
      expect(typeof status!.projectId).toBe('number');
    });

    test('not logged in', async () => {
      const anotherClient = setupClient();
      await anotherClient.authenticate();
      const status = await anotherClient.login.status();
      expect(status).toBeNull();
    });

    test('invalid credentials', async () => {
      const anotherClient = setupClient();
      const status = await anotherClient.login.status();
      expect(status).toBeNull();
    });
  });
});
