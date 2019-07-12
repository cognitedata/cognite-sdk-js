// Copyright 2019 Cognite AS

import CogniteClient from '../../cogniteClient';
import { CogniteError } from '../../error';
import { CogniteMultiError } from '../../multiError';
import { Asset } from '../../types/types';
import { sleepPromise } from '../../utils';
import { randomInt, setupLoggedInClient } from '../testUtils';

// tslint:disable-next-line:no-big-function
describe('Asset integration test', () => {
  let client: CogniteClient;
  beforeAll(async () => {
    client = setupLoggedInClient();
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
    name: 'test-child',
    description: 'Child asset for cognitesdk-js test',
    metadata: {
      refId: 'test-child',
    },
    parentExternalId: rootAsset.externalId,
  };
  let assets: Asset[];

  test('create', async () => {
    assets = await client.assets.create([childAsset, rootAsset]);
    expect(assets[0].createdTime).toBeInstanceOf(Date);
    expect(assets[0].lastUpdatedTime).toBeInstanceOf(Date);
  });

  test('create empty asset array', async () => {
    const err = new CogniteMultiError({
      succeded: [],
      failed: [[]],
      errors: [
        new CogniteError(
          'createAssets.arg0.items: size must be between 1 and 1000',
          400
        ),
      ],
      responses: [],
    });
    await client.assets.create([]).catch(e => {
      expect(e.missing).toEqual(err.missing);
      expect(e.failed).toEqual(err.failed);
      expect(e.succeded).toEqual(err.succeded);
      expect(e.status).toEqual(err.status);
      expect(e.errors[0]).toEqual(err.errors[0]);
      expect(e.responses).toEqual(err.responses);
    });
  });

  test('create 1001 assets (1 corrupted): error handling', async () => {
    const newRootAsset = {
      ...rootAsset,
      externalId: 'test-root' + randomInt(),
    };
    const corruptedChild = {
      ...childAsset,
      extraProp: 'corrupted',
      parentExternalId: newRootAsset.externalId,
    };
    const newChildAsset = {
      ...childAsset,
      parentExternalId: newRootAsset.externalId,
    };
    const childArr = new Array(999).fill(newChildAsset);
    try {
      await client.assets.create([newRootAsset, ...childArr, corruptedChild]);
    } catch (e) {
      expect(e).toBeInstanceOf(CogniteMultiError);
      if (e instanceof CogniteMultiError) {
        expect(e.status).toEqual(400);
        expect(e.failed).toEqual([corruptedChild]);
        expect(e.succeded).toEqual([newRootAsset, ...childArr]);
        expect(e.responses[0].items.length).toBe(1000);
        expect((e.errors[0] as CogniteError).status).toBe(400);
        expect(e.errors.length).toBe(1);
        expect(e.responses.length).toBe(1);
        await client.assets.delete(
          e.responses[0].items.map((asset: any) => ({ id: asset.id }))
        );
      }
    }
    expect.assertions(8);
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
    const childArr = new Array(1000).fill(newChildAsset);
    const createdAssets = await client.assets.create([
      newRootAsset,
      ...childArr,
    ]);
    expect(createdAssets.length).toBe(1001);
    await client.assets.delete([{ id: createdAssets[0].id }], {
      recursive: true,
    }); // only need to delete the root asset
  });

  test('fail to delete a root asset with children', async () => {
    const newRootAsset = {
      ...rootAsset,
      externalId: 'test-root' + randomInt(),
    };
    const newChildAsset = {
      ...childAsset,
      parentExternalId: newRootAsset.externalId,
    };
    await client.assets.create([newRootAsset, newChildAsset]);
    await sleepPromise(5000);
    const prom = client.assets.delete([
      { externalId: newRootAsset.externalId },
    ]);
    expect(prom).rejects.toThrow();

    // clean up
    await client.assets.delete([{ externalId: newRootAsset.externalId }], {
      recursive: true,
    });
  });

  test('retrieve', async () => {
    const response = await client.assets.retrieve([{ id: assets[0].id }]);
    expect(response).toEqual([assets[0]]);
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
    const response = await client.assets.list({ limit: 1 });
    expect(response.nextCursor).toBeDefined();
    expect(response.items).toBeDefined();
    expect(response.items[0].id).toBeDefined();
  });

  test('list with autoPaging', async () => {
    await client.assets
      .list({
        filter: {
          name: rootAsset.name,
          createdTime: { min: 0, max: Date.now() },
        },
      })
      .autoPagingToArray({ limit: 100 });
  });

  test('filter rootIds', async () => {
    const root1 = { name: 'root-1', externalId: 'root-1' + randomInt() };
    const root2 = { name: 'root-2', externalId: 'root-2' + randomInt() };
    const child1 = { name: 'child-1', parentExternalId: root1.externalId };
    const child2 = { name: 'child-2', parentExternalId: root2.externalId };
    const [createdChild1] = await client.assets.create([
      child1,
      root1,
      root2,
      child2,
    ]);
    const nonRootAssets = await client.assets
      .list({
        filter: { root: false },
        limit: 2,
      })
      .autoPagingToArray({ limit: 2 });
    expect(nonRootAssets.length).toBe(2);
    await sleepPromise(15000);
    const nonRootAssetsUnderRootId = await client.assets
      .list({
        filter: { root: false, rootIds: [{ externalId: root1.externalId }] },
        limit: 2,
      })
      .autoPagingToArray({ limit: 2 });
    expect(nonRootAssetsUnderRootId.length).toBe(1);
    expect(nonRootAssetsUnderRootId[0].id).toBe(createdChild1.id);
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
