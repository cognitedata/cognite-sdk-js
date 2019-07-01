// Copyright 2019 Cognite AS

import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { CogniteClient } from '../..';
import { Asset } from '../../resources/classes/asset';
import { AssetList } from '../../resources/classes/assetList';
import { randomInt, setupLoggedInClient } from '../testUtils';

describe('Asset class', () => {
  const axiosInstance = axios.create();
  const axiosMock = new MockAdapter(axiosInstance);
  let client: CogniteClient;
  beforeAll(() => {
    client = setupLoggedInClient();
  });
  beforeEach(() => {
    axiosMock.reset();
  });
  const rootAsset = {
    name: 'test-root',
    description: 'Root asset for cognitesdk-js test',
    metadata: {
      refId: 'test-root',
    },
    externalId: 'test-root' + randomInt(),
  };

  const childAsset = {
    // tslint:disable-next-line:no-duplicate-string
    name: 'test-child',
    description: 'Child asset for cognitesdk-js test',
    metadata: {
      refId: 'test-child',
    },
    parentExternalId: rootAsset.externalId,

    externalId: 'test-child' + randomInt(),
  };
  let assets: Asset[];

  test('create', async () => {
    assets = await client.assets.create([childAsset, rootAsset]);
    const assetList = new AssetList(client, assets);
    expect(assets[0].createdTime).toBeInstanceOf(Date);
    expect(assets[0].lastUpdatedTime).toBeInstanceOf(Date);
    expect(assetList).toBeInstanceOf(Array);
  });

  test('create 1001 assets sequencially', async () => {
    const newRootAsset = {
      ...rootAsset,
      externalId: 'test-root' + randomInt(),
    };
    const newChildAsset = {
      ...childAsset,
      parentExternalId: newRootAsset.externalId,
    };
    // const newGrandChildAsset = {
    //   ...childAsset,
    //   parentExternalId: newChildAsset.externalId,
    // };
    const childArr = new Array(1000).fill(newChildAsset);
    const createdAssets = await client.assets.create([
      newRootAsset,
      ...childArr,
    ]);
    expect(createdAssets.length).toBe(1001);
    const assetListObject = new AssetList(client, createdAssets);
    expect(assetListObject).toBeDefined();
    // await assetListObject.delete();
    // const s = await client.assets.list({
    //   filter: { name: assetListObject[0].name },
    // });
    // console.log(s);
    await client.assets.delete(
      createdAssets.slice(1).map(asset => ({ id: asset.id }))
    );
    await client.assets.delete([{ id: createdAssets[0].id }]);
  });

  test('subtree', async () => {
    const newRootAsset = {
      ...rootAsset,
      externalId: 'test-root' + randomInt(),
    };

    const childArray = [];
    for (let index = 0; index < 3; index++) {
      const newChildAsset = {
        ...childAsset,
        parentExternalId: newRootAsset.externalId,
        externalId: 'test-child' + randomInt() + index,
      };
      childArray.push(newChildAsset);
    }
    const grandChildArray = [];
    for (let index = 5; index < 7; index++) {
      const newGrandChildAsset = {
        ...childAsset,
        name: 'test-grandchild',
        parentExternalId: childArray[0].parentExternalId,
        externalId: 'test-grandchild' + randomInt() + index,
      };
      grandChildArray.push(newGrandChildAsset);
    }
    const createdAssets = await client.assets.create([
      newRootAsset,
      ...childArray,
      ...grandChildArray,
    ]);
    expect(createdAssets.length).toBe(6);
    expect(childArray[0]);
    const subtree = await createdAssets[0].subtree(2);
    console.log(subtree);
    expect(subtree.length).toBe(6);
  });

  test('update', async () => {
    await client.assets.update([
      {
        id: assets[0].id,
        update: {
          name: { set: 'New name' },
        },
      },
    ]);
  });

  test('delete', async () => {
    await client.assets.delete(
      assets.map(asset => ({
        id: asset.id,
      }))
    );
  });

  test('list', async () => {
    await client.assets
      .list({
        filter: {
          name: rootAsset.name,
          createdTime: { min: 0, max: Date.now() },
        },
      })
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
