// Copyright 2020 Cognite AS

import { beforeAll, describe, expect, test } from 'vitest';
import { setupLoggedInClient } from '../testUtils';

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
  });
});
