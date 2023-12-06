// Copyright 2023 Cognite AS

import CogniteClient from '../../cogniteClient';
import { setupLoggedInClient } from '../testUtils';

describe('User Profiles', () => {
  let client: CogniteClient;
  beforeEach(() => {
    client = setupLoggedInClient();
  });

  describe('client.profiles.me', () => {
    test('fetch me', async () => {
      const profiles = await client.profiles.me();
      expect(profiles).toBeDefined();
    });
  });

  describe('client.profiles.retrieve', () => {
    test('fetch list of users', async () => {
      const me = await client.profiles.me();
      const profile = await client.profiles.retrieve([
        { userIdentifier: me.userIdentifier },
      ]);
      expect(profile).toBeDefined();
    });
  });

  describe('client.profiles.list', () => {
    test('fetch list of users', async () => {
      const profiles = await client.profiles.list();
      expect(profiles).toBeDefined();
    });

    test('fetch list of users with limit = 2 + cursors', async () => {
      const profiles = await client.profiles.list({ limit: 2 });
      expect(profiles.items.length).toBe(2);

      const nextProfiles = await client.profiles.list({
        limit: 2,
        cursor: profiles.nextCursor,
      });
      expect(nextProfiles.items.length).toBe(2);
      expect(nextProfiles).not.toEqual(profiles);
    });
  });
});
