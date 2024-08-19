// Copyright 2020 Cognite AS

import { beforeAll, describe, expect, test } from 'vitest';
import { setupLoggedInClient } from './testUtils';

describe('derived integration', () => {
  let client: CogniteClient;
  beforeAll(async () => {
    client = setupLoggedInClient();
  });
  // test that the client behaves as stable
  test('assets list', async () => {
    const response = await client.assets.list();
    expect(response.items.length).toBeGreaterThan(0);
  });
  test('raw get assets', async () => {
    const response = await client.get(
      `/api/v1/projects/${process.env.COGNITE_PROJECT}/assets`
    );
    expect(response.data).toHaveProperty('items');
  });
});
