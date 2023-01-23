// Copyright 2020 Cognite AS

import CogniteClient from '../../cogniteClient';
import { setupClient, setupLoggedInClient } from '../testUtils';

describe('Login-api integration test', () => {
  let client: CogniteClient;
  beforeAll(async () => {
    client = setupLoggedInClient();
  });

  describe('status', () => {
    test('logged in', async () => {
      const token = await client.authenticate();
      const inspect = (await client.get('/api/v1/token/inspect')).data;
      expect(token).toBeDefined();
      expect(inspect.projects[0].projectUrlName).toBeDefined();
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
