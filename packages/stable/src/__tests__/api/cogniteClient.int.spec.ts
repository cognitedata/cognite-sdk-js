// Copyright 2020 Cognite AS

import CogniteClient from '../../cogniteClient';
import { Asset, ItemsWrapper } from '../../types';
import { setupLoggedInClient } from '../testUtils';

describe('http methods - integration', () => {
  let client: CogniteClient;
  const project = 'platypus'; //process.env.COGNITE_PROJECT as string;
  beforeAll(async () => {
    client = setupLoggedInClient();
  });
  test('post method', async () => {
    const assets = [{ name: 'First asset' }, { name: 'Second asset' }];
    const response = await client.post<ItemsWrapper<Asset[]>>(
      `/api/v1/projects/${project}/assets`,
      { data: { items: assets } }
    );
    expect(response.data.items).toHaveLength(2);
  });
  test('get method', async () => {
    const response = await client.get(`/api/v1/projects/${project}/assets`);
    expect(response.data).toHaveProperty('items');
  });
});
