// Copyright 2026 Cognite AS

import nock from 'nock';
import { beforeEach, describe, expect, test } from 'vitest';
import type CogniteClient from '../../cogniteClient';
import type { TokenInspect } from '../../types';
import { mockBaseUrl, setupMockableClient } from '../testUtils';

describe('Token unit test', () => {
  let client: CogniteClient;
  beforeEach(() => {
    client = setupMockableClient();
    nock.cleanAll();
  });

  test('inspect returns the access of the current user', async () => {
    const tokenInspect: TokenInspect = {
      subject: 'test-subject',
      projects: [{ projectUrlName: 'test-project', groups: [1] }],
      capabilities: [
        {
          assetsAcl: { actions: ['READ', 'WRITE'], scope: { all: {} } },
          projectScope: { projects: ['test-project'] },
        },
      ],
    };
    nock(mockBaseUrl)
      .get('/api/v1/token/inspect')
      .once()
      .reply(200, tokenInspect);

    const res = await client.token.inspect();
    expect(res).toEqual(tokenInspect);
  });
});
