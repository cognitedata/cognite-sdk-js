// Copyright 2019 Cognite AS

import { Asset, ItemsResponse } from '@/types/types';
import CogniteClient from '../cogniteClient';
import { setupLoggedInClient } from './testUtils';

describe('createClientWithApiKey - integration', () => {
  test('handle non-exisiting api-key', async () => {
    const client = new CogniteClient({
      appId: 'JS Integration test',
    });
    client.loginWithApiKey({
      project: 'cognitesdk-js',
      apiKey: 'non-exisiting-api-key',
    });
    await expect(
      client.assets.list({ limit: 1 }).autoPagingToArray({ limit: 1 })
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `"Request failed | status code: 401"`
    );
  });
});

describe('http methods - integration', () => {
  let client: CogniteClient;
  beforeAll(async () => {
    client = setupLoggedInClient();
  });
  test('post method', async () => {
    const assets = [{ name: 'First asset' }, { name: 'Second asset' }];
    const response = await client.post<ItemsResponse<Asset[]>>(
      '/api/v1/projects/cognitesdk-js/assets',
      { data: { items: assets } }
    );
    expect(response.data.items).toHaveLength(2);
  });
  test('get method', async () => {
    const response = await client.get('/api/v1/projects/cognitesdk-js/assets');
    expect(response.data).toHaveProperty('items');
  });
});
