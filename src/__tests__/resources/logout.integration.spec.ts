// Copyright 2019 Cognite AS

import CogniteClient from '../../cogniteClient';
import { setupClient, setupLoggedInClient } from '../testUtils';

describe('logout-api integration test', () => {
  let loggedInClient: CogniteClient;
  let anonymClient: CogniteClient;
  beforeAll(async () => {
    loggedInClient = setupLoggedInClient();
    anonymClient = setupClient();
  });

  describe('logout url', () => {
    test('logged in', async () => {
      const url = await loggedInClient.logout.getUrl();
      expect(typeof url).toBe('string');
    });

    test('not logged in', async () => {
      const url = await anonymClient.logout.getUrl();
      expect(url).toBeNull();
    });

    test('invalid credentials', async () => {
      anonymClient.loginWithApiKey({
        project: 'abc',
        apiKey: '123',
      });
      const url = await anonymClient.logout.getUrl();
      expect(url).toBeNull();
    });
  });
});
