// Copyright 2020 Cognite AS

import { CogniteError, CogniteMultiError } from '@cognite/sdk-core';
import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import type CogniteClient from '../../cogniteClient';
import type { Asset, LabelDefinition } from '../../types';
import {
  randomInt,
  runTestWithRetryWhenFailing,
  setupLoggedInClient,
} from '../testUtils';

describe.skip('Asset integration test', () => {
  let client: CogniteClient;
  let label: LabelDefinition;

  beforeAll(async () => {
    client = setupLoggedInClient();
    [label] = await client.labels.create([
      {
        externalId: `test-asset-lable-${randomInt()}`,
        name: 'asset-label',
        description: 'test label',
      },
    ]);
  });

  afterAll(async () => {
    await client.labels.delete([{ externalId: label.externalId }]);
  });

  const rootAsset = {
    name: 'test-root',
    description: 'Root asset for cognitesdk-js test',
    metadata: {
      refId: 'test-root',
    },
    externalId: `test-root${randomInt()}`,
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
    assets = await client.assets.create([
      { ...childAsset, labels: [{ externalId: label.externalId }] },
      rootAsset,
    ]);
    expect(assets[0].createdTime).toBeInstanceOf(Date);
    expect(assets[0].lastUpdatedTime).toBeInstanceOf(Date);
    expect(assets[0].labels?.length).toBe(1);
  });

  test('create empty asset array', async () => {
    const err = new CogniteMultiError({
      succeded: [],
      failed: [[]],
      errors: [
        new CogniteError(
          'Request had 1 constraint violations. Please fix the request and try again. [items size must be between 1 and 1000]',
          400,
        ),
      ],
      responses: [],
    });
    await client.assets.create([]).catch((e) => {
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
      externalId: `test-root${randomInt()}`,
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
          e.responses[0].items.map((asset: Asset) => ({
            id: asset.id,
          })),
        );
      }
    }
    expect.assertions(8);
  });

  test('create 1001 assets sequencially', async () => {
    const newRootAsset = {
      ...rootAsset,
      externalId: `test-root${randomInt()}`,
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

  test('return parentExternalId', async () => {
    const newRootAsset = {
      ...rootAsset,
      externalId: `test-root${randomInt()}`,
    };
    const newChildAsset = {
      ...childAsset,
      parentExternalId: newRootAsset.externalId,
    };
    const createdAssets = await client.assets.create([
      newRootAsset,
      newChildAsset,
    ]);
    expect(createdAssets[1].parentExternalId).toBe(newRootAsset.externalId);
    await client.assets.delete([{ id: createdAssets[0].id }], {
      recursive: true,
    }); // only need to delete the root asset
  });

  test('fail to delete a root asset with children', async () => {
    await runTestWithRetryWhenFailing(async () => {
      const newRootAsset = {
        ...rootAsset,
        externalId: `test-root${randomInt()}`,
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

  test('retrieve with unknown ids and aggregatedProperties', async () => {
    const response = await client.assets.retrieve(
      [{ externalId: '<does not exist>' }],
      {
        ignoreUnknownIds: true,
        aggregatedProperties: ['childCount'],
      },
    );
    expect(response).toHaveLength(0);
  });

  test('update', async () => {
    const updatedName = 'New name';

    const [{ name }] = await client.assets.update([
      {
        id: assets[0].id,
        update: {
          name: { set: updatedName },
        },
      },
    ]);
    expect(name).toEqual(updatedName);
  });

  test('update - wipe metadata', async () => {
    const key = 'some';
    const updatedMetadata = { [key]: 'some' };

    const [{ metadata }] = await client.assets.update([
      {
        id: assets[0].id,
        update: {
          metadata: { set: updatedMetadata },
        },
      },
    ]);

    expect(metadata?.[key]).toEqual(updatedMetadata[key]);

    const [{ metadata: wipedMetadata }] = await client.assets.update([
      {
        id: assets[0].id,
        update: {
          metadata: { set: {} },
        },
      },
    ]);

    expect(wipedMetadata).toEqual({});
  });

  test('aggregates', async () => {
    await runTestWithRetryWhenFailing(async () => {
      const [assetInfo] = await client.assets
        .list({
          aggregatedProperties: ['childCount', 'path', 'depth'],
          filter: {
            externalIdPrefix: rootAsset.externalId,
          },
        })
        .autoPagingToArray({ limit: 1 });
      expect(assetInfo.aggregates?.childCount).toBe(1);
      expect(assetInfo.aggregates?.depth).toBe(0);
      expect(assetInfo.aggregates?.path).toEqual([{ id: assetInfo.id }]);
    });
  });

  test('list', async () => {
    const { nextCursor, items } = await client.assets.list({
      limit: 1,
      partition: '1/10',
    });
    expect(nextCursor).toBeDefined();
    expect(items).toBeDefined();
    expect(items[0].id).toBeDefined();
    expect(items.length).toBe(1);
  });

  test('list.next', async () => {
    const response = await client.assets.list({ limit: 1 });
    expect(response.next).toBeDefined();
    if (!response.next) {
      throw new Error('Expected next to be defined');
    }
    const nextPage = await response.next();
    expect(nextPage.items[0]).toBeTruthy();
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

  let [createdChild1, createdRoot1, ...createdAssets2]: Asset[] = [];
  test('filter rootIds', async () => {
    const root1 = { name: 'root-1', externalId: `root-1${randomInt()}` };
    const root2 = { name: 'root-2', externalId: `root-2${randomInt()}` };
    const child1 = { name: 'child-1', parentExternalId: root1.externalId };
    const child2 = { name: 'child-2', parentExternalId: root2.externalId };
    [createdChild1, createdRoot1, ...createdAssets2] =
      await client.assets.create([child1, root1, root2, child2]);

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

  test('filter on asset subtree ids', async () => {
    await runTestWithRetryWhenFailing(async () => {
      const { items } = await client.assets.list({
        limit: 1,
        filter: {
          assetSubtreeIds: [{ id: createdChild1.id }],
        },
      });
      expect(items[0].id).toEqual(createdChild1.id);
      expect(items.length).toBe(1);
    });
  });

  test('filter on parent external ids', async () => {
    await runTestWithRetryWhenFailing(async () => {
      const { items } = await client.assets.list({
        limit: 1,
        filter: {
          parentExternalIds: [createdRoot1.externalId || ''],
        },
      });
      expect(items[0].id).toEqual(createdChild1.id);
      expect(items.length).toBe(1);
    });
  });

  test('filter by label', async () => {
    const { items } = await client.assets.list({
      filter: {
        labels: {
          containsAny: [{ externalId: label.externalId }],
        },
      },
    });

    expect(items.length).toBe(1);
    expect(items[0].id).toBe(assets[0].id);
  });

  test('count aggregate', async () => {
    const aggregates = await client.assets.aggregate({
      filter: {
        parentExternalIds: [createdRoot1.externalId || ''],
      },
    });
    expect(aggregates.length).toBe(1);
    expect(aggregates[0].count).toBeGreaterThan(0);
  });

  test('count aggregate by label', async () => {
    const aggregates = await client.assets.aggregate({
      filter: {
        labels: {
          containsAny: [{ externalId: label.externalId }],
        },
      },
    });

    expect(aggregates.length).toBe(1);
    expect(aggregates[0].count).toBe(1);
  });

  test('search for root test asset', async () => {
    const result = await client.assets.search({
      filter: {
        name: rootAsset.name,
      },
    });
    expect(result.length).toBeGreaterThan(0);
  });

  test('search query for root test asset', async () => {
    const result = await client.assets.search({
      search: {
        query: rootAsset.name,
      },
    });
    expect(result.length).toBeGreaterThan(0);
  });

  test('strange limit behaviour', async () => {
    const limit = 5;
    const result = await client.assets
      .list({ limit: 1 })
      .autoPagingToArray({ limit });
    expect(result.length).toBe(limit);
  });

  test('update by deleting label', async () => {
    const [updatedAsset] = await client.assets.update([
      {
        id: assets[0].id,
        update: {
          labels: {
            remove: [{ externalId: label.externalId }],
          },
        },
      },
    ]);

    expect(updatedAsset.labels).toBe(undefined);
  });

  test('delete', async () => {
    await client.assets.delete(
      [createdChild1, createdRoot1, ...createdAssets2, ...assets].map(
        ({ id }) => ({ id }),
      ),
    );
  });
});
