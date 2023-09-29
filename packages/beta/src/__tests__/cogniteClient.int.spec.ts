// Copyright 2020 Cognite AS

import CogniteClient from '../cogniteClient';
import { setupLoggedInClient, itif } from './testUtils';

describe('beta integration', () => {
  const client: CogniteClient | null = setupLoggedInClient();

  test('client is initialized', () => {
    expect(client).not.toBeNull();
  });
  itif(client)('assets list', async () => {
    const response = await client!.assets.list();
    expect(response.items.length).toBeGreaterThan(0);
  });
  itif(client)('raw get assets', async () => {
    const project = process.env.COGNITE_PROJECT as string;
    const response = await client!.get(`/api/v1/projects/${project}/assets`);
    expect(response.data).toHaveProperty('items');
  });
});
