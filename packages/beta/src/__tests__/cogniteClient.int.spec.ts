// Copyright 2020 Cognite AS

import CogniteClient from '../cogniteClient';
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
    const response = await client.get('/api/v1/projects/cognitesdk-js/assets');
    expect(response.data).toHaveProperty('items');
  });
  test('overridden', async () => {
    expect((client as any).version.endsWith('beta')).toBeTruthy();
    const timeserieses = await client.timeseries.list().autoPagingToArray();
    timeserieses[0].myBetaField; //It's here!
  });
});
