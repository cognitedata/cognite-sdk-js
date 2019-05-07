// Copyright 2019 Cognite AS

import { createClientWithApiKey } from '../../index';
import { API } from '../../resources/api';

describe('Asset integration test', async () => {
  let client: API;
  beforeAll(async () => {
    client = await createClientWithApiKey({
      project: process.env.COGNITE_PROJECT as string,
      apiKey: process.env.COGNITE_CREDENTIALS as string,
    });
  });
  const rootAsset = {
    name: 'test-root',
    description: 'Root asset for cognitesdk-js test',
    metadata: {
      refId: 'test-root',
    },
    refId: 'test-root',
  };

  const childAsset = {
    name: 'test-child',
    description: 'Child asset for cognitesdk-js test',
    metadata: {
      refId: 'test-child',
    },
    parentRefId: 'test-root',
  };

  test('create,retrieve,update,delete', async () => {
    const assets = await client.assets.create([childAsset, rootAsset]);
    await client.assets.retrieve([{ id: assets[0].id }]);
    await client.assets.update([
      {
        id: assets[0].id,
        update: {
          name: { set: 'New name' },
        },
      },
    ]);
    await client.assets.delete(
      assets.map(asset => ({
        id: asset.id,
      }))
    );
  });

  test('list', async () => {
    await client.assets
      .list({ filter: { name: rootAsset.name } })
      .autoPagingToArray({ limit: 100 });
  });

  test('search for root test asset', async () => {
    const result = await client.assets.search({
      search: {
        name: rootAsset.name,
      },
    });
    const asset = result[0];
    expect(rootAsset.name).toBe(asset.name);
    expect(rootAsset.description).toBe(asset.description);
  });
});
