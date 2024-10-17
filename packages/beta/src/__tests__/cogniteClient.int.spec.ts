// Copyright 2020 Cognite AS

import { beforeAll, describe, expect, test } from 'vitest';
import type CogniteClient from '../cogniteClient';
import { setupLoggedInClient } from './testUtils';

describe('beta integration', () => {
  let client: CogniteClient;
  beforeAll(async () => {
    client = setupLoggedInClient();
  });
  test('assets list', async () => {
    const response = await client.assets.list();
    expect(response.items.length).toBeGreaterThan(0);
  });
  test('raw get assets', async () => {
    const project = process.env.COGNITE_PROJECT as string;
    const response = await client.get(`/api/v1/projects/${project}/assets`);
    expect(response.data).toHaveProperty('items');
  });
});
