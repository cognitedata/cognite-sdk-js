// Copyright 2020 Cognite AS

import CogniteClient from '../../cogniteClient';
import { setupLoggedInClient } from '../testUtils';

describe('User Profiles unit test', () => {
  let client: CogniteClient;
  beforeEach(() => {
    client = setupLoggedInClient();
  });

  describe('client.profiles.me', () => {
    test('fetch me', async () => {
      const profile = await client.profiles.me();
      expect(profile).toBeDefined();
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
      const profile = await client.profiles.list();
      expect(profile).toBeDefined();
    });

    test('fetch list of users with limit = 2 + cursors', async () => {
      const profile = await client.profiles.list({ limit: 2 });
      expect(profile.items.length).toBe(2);

      const nextProfiles = await client.profiles.list({
        limit: 2,
        cursor: profile.nextCursor,
      });
      expect(nextProfiles.items.length).toBe(2);
    });

    test('fetch list of users with limit = 2 + cursors', async () => {
      const profile = await client.profiles.list({ limit: 2 });
      expect(profile.items.length).toBe(2);

      const nextProfiles = await client.profiles.list({
        limit: 2,
        cursor: profile.nextCursor,
      });
      expect(nextProfiles.items.length).toBe(2);
    });
  });

  describe('client.profiles.search', () => {
    test('fetch list of users', async () => {
      const me = await client.profiles.me();

      const searchForMe = await client.profiles.search({
        search: { name: me.displayName || '' },
      });
      console.log(searchForMe);
      expect(searchForMe.length).toBe(1);
    });
  });
});
