// Copyright 2024 Cognite AS

import nock from 'nock';
import CogniteClient from '../../cogniteClient';
import { setupMockableClient } from '../testUtils';
import { mockBaseUrl } from '../testUtils';

describe('Groups unit test', () => {
  let client: CogniteClient;
  beforeEach(() => {
    client = setupMockableClient();
    nock.cleanAll();
  });

  test('can create a CDF managed allUserAccounts group', async () => {
    nock(mockBaseUrl)
      .post(new RegExp('/groups'), {
        name: 'test-group',
        members: 'allUserAccounts',
      })
      .once()
      .reply(200, {
        name: 'test-group',
        members: 'allUserAccounts',
      });
    await client.groups.create([
      {
        name: 'test-group',
        members: 'allUserAccounts',
      },
    ]);
  });

  test('can create a CDF managed group', async () => {
    nock(mockBaseUrl)
      .post(new RegExp('/groups'), {
        name: 'test-group',
        members: ['a', 'b'],
      })
      .once()
      .reply(200, {
        name: 'test-group',
        members: ['a', 'b'],
      });
    await client.groups.create([
      {
        name: 'test-group',
        members: ['a', 'b'],
      },
    ]);
  });
});
