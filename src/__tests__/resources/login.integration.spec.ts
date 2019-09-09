// Copyright 2019 Cognite AS

import CogniteClient from '../../cogniteClient';
import { setupClient, setupLoggedInClient } from '../testUtils';

describe('Login-api integration test', () => {
  let client: CogniteClient;
  beforeAll(async () => {
    client = setupLoggedInClient();
  });

  describe('status', () => {
    test('logged in', async () => {
      const status = await client.login.status();
      expect(status).toBeDefined();
      expect(status!.project).toBeDefined();
      expect(status!.user).toBeDefined();
      expect(typeof status!.projectId).toBe('number');
    });

    test('not logged in', async () => {
      const anotherClient = setupClient();
      const status = await anotherClient.login.status();
      expect(status).toBeNull();
    });

    test('invalid credentials', async () => {
      const anotherClient = setupClient();
      anotherClient.loginWithApiKey({
        project: 'abc',
        apiKey: '123',
      });
      const status = await anotherClient.login.status();
      expect(status).toBeNull();
    });
  });
});
