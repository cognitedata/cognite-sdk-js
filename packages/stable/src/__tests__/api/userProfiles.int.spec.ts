// Copyright 2023 Cognite AS

import { beforeEach, describe, expect, test } from 'vitest';
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
      const profiles = await client.profiles.list({ limit: 1 });
      expect(profiles.items.length).toBe(1);

      const nextProfiles = await client.profiles.list({
        limit: 1,
        cursor: profiles.nextCursor,
      });
      expect(nextProfiles.items.length).toBe(1);
      expect(nextProfiles).not.toEqual(profiles);
    });
  });
});
