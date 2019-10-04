// Copyright 2019 Cognite AS

import CogniteClient from '../../cogniteClient';
import { CogniteError } from '../../error';
import { CogniteMultiError } from '../../multiError';
import { Asset as AssetClass } from '../../resources/classes/asset';
import { Asset } from '../../types/types';
import {
  randomInt,
  runTestWithRetryWhenFailing,
  setupLoggedInClient,
} from '../testUtils';

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
          'Request had 1 constraint violations. Please fix the request and try again. [items size must be between 1 and 1000]',
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
    await runTestWithRetryWhenFailing(async () => {
      const newRootAsset = {
        ...rootAsset,
        externalId: 'test-root' + randomInt(),
      };
      const newChildAsset = {
        ...childAsset,
        parentExternalId: newRootAsset.externalId,
      };
      await client.assets.create([newRootAsset, newChildAsset]);
      const deletePromise = client.assets.delete([
        { externalId: newRootAsset.externalId },
      ]);
      await expect(deletePromise).rejects.toThrow();

      // clean up
      await client.assets.delete([{ externalId: newRootAsset.externalId }], {
        recursive: true,
      });
    });
  });

  test('retrieve', async () => {
    const response = await client.assets.retrieve([{ id: assets[0].id }]);
    expect(response[0].name).toEqual(assets[0].name);
    expect(response).toHaveLength(1);
    expect(response[0].createdTime).toBeInstanceOf(Date);
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

  test('childCount aggregate', async () => {
    await runTestWithRetryWhenFailing(async () => {
      const [assetInfo] = await client.assets
        .list({
          aggregatedProperties: ['childCount'],
          filter: {
            externalIdPrefix: rootAsset.externalId,
          },
        })
        .autoPagingToArray({ limit: 1 });
      expect(assetInfo.aggregates!.childCount).toBe(1);
    });
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
    expect(response.items[0]).toBeInstanceOf(AssetClass);
  });

  test('list.next', async () => {
    const response = await client.assets.list({ limit: 1 });
    expect(response.next).toBeDefined();
    const nextPage = await response.next!();
    expect(nextPage.items[0]).toBeInstanceOf(AssetClass);
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
    const [createdChild1, createdRoot1] = await client.assets.create([
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

    await runTestWithRetryWhenFailing(async () => {
      const nonRootAssetsUnderRootId = await client.assets
        .list({
          filter: { root: false, rootIds: [{ id: createdRoot1.id }] },
          limit: 2,
        })
        .autoPagingToArray({ limit: 2 });
      expect(nonRootAssetsUnderRootId.length).toBe(1);
      expect(nonRootAssetsUnderRootId[0].id).toBe(createdChild1.id);
    });
  });

  test('search for root test asset', async () => {
    const result = await client.assets.search({
      filter: {
        name: rootAsset.name,
      },
    });
    expect(result.length).toBeGreaterThan(0);
  });
});
