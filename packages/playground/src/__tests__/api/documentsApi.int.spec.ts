// Copyright 2020 Cognite AS

import CogniteClientPlayground from '../../cogniteClientPlayground';
import { setupLoggedInClient } from '../testUtils';

describe('documents api', () => {
  let client: CogniteClientPlayground;

  beforeAll(async () => {
    client = setupLoggedInClient();
  });

  test('list documents', async () => {
    const response = await client.documents.list();
    expect(response.items.length).toBeGreaterThan(0);
  });
  test('list documents, limit to 1', async () => {
    const response = await client.documents.list({ limit: 1 });
    expect(response.items.length).toEqual(1);
  });
});
