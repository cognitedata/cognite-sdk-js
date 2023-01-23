// Copyright 2020 Cognite AS

import CogniteClient from '../cogniteClient';
import { setupLoggedInClient } from './testUtils';

describe('beta integration', () => {
  let client: CogniteClient;
  beforeAll(async () => {
    client = setupLoggedInClient(process.env.COGNITE_BASE_URL);
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
