// Copyright 2020 Cognite AS

import { afterAll, beforeAll, describe, expect, test, vi } from 'vitest';
import type CogniteClient from '../../cogniteClient';
import type { Asset, NodeWrite, Timeseries } from '../../types';
import {
  randomInt,
  runTestWithRetryWhenFailing,
  setupLoggedInClient,
} from '../testUtils';

describe('Timeseries integration test', () => {
  let client: CogniteClient;
  let asset: Asset;
  beforeAll(async () => {
    client = setupLoggedInClient();
    [asset] = await client.assets.create([
      {
        name: `asset_${randomInt()}`,
        externalId: `external_${randomInt()}`,
      },
    ]);
    await vi.waitFor(
      async () => {
        await client.spaces.upsert([testSpace]);
        await client.instances.upsert({
          items: [timeseriesCdmInstance],
        });
      },
      {
        timeout: 25 * 1000,
        interval: 1000,
      }
    );
  }, 25_000);

  afterAll(async () => {
    await client.assets.delete([{ id: asset.id }]);
    await client.instances.delete([
      {
        instanceType: 'node',
        externalId: timeseriesCdmInstance.externalId,
        space: timeseriesCdmInstance.space,
      },
    ]);
  });

  const timeseries = [
    {
      name: 'timeserie1',
      externalId: `external_${randomInt()}`,
      metadata: {
        createdTime: 'now',
      },
    },
    {
      name: 'timeserie2',
      unit: 'bar',
      isString: true,
    },
    {
      name: 'timeserie3',
      unit: 'bar',
      isString: true,
    },
    {
      name: 'timeserie3',
      unit: 'bar',
      isString: true,
    },
    {
      name: 'timeserie4',
      unit: 'bar',
      isString: true,
    },
    {
      name: 'timeserie4',
      unit: 'bar',
      isString: true,
    },
    {
      name: 'timeserie5',
      unit: 'bar',
      isString: true,
    },
    {
      name: 'timeserie6',
      unit: 'bar',
      isString: true,
    },
    {
      name: 'timeserie7',
      unit: 'bar',
      isString: true,
    },
    {
      name: 'timeserie8',
      unit: 'bar',
      isString: true,
    },
    {
      name: 'timeserie9',
      unit: 'bar',
      isString: true,
    },
    {
      name: 'timeserie10',
      unit: 'bar',
      isString: true,
    },
  ];

  const testSpace = {
    space: 'test_data_space',
    name: 'test_data_space',
    description: 'Instance space used for integration tests.',
  };

  const timeseriesCdmInstance: NodeWrite = {
    externalId: `external_${randomInt()}`,
    space: testSpace.space,
    instanceType: 'node',
    sources: [
      {
        source: {
          externalId: 'CogniteTimeSeries',
          space: 'cdf_cdm',
          type: 'view',
          version: 'v1',
        },
        properties: {
          type: 'numeric',
        },
      },
    ],
  };

  const timeseriesCdmInstanceId = {
    externalId: timeseriesCdmInstance.externalId,
    space: timeseriesCdmInstance.space,
  };

  let createdTimeseries: Timeseries[];

  test('create', async () => {
    createdTimeseries = await client.timeseries.create(timeseries);
    expect(createdTimeseries[0].id).toBeDefined();
    expect(createdTimeseries[0].lastUpdatedTime).toBeInstanceOf(Date);
    expect(createdTimeseries[0].metadata?.createdTime).not.toBeInstanceOf(Date);
  });

  test('retrieve', async () => {
    const [single] = await client.timeseries.retrieve([
      { id: createdTimeseries[0].id },
    ]);
    expect(single.name).toBe(timeseries[0].name);
  });

  test('retrieve by instance id', async () => {
    const [single] = await client.timeseries.retrieve([
      { instanceId: timeseriesCdmInstanceId },
    ]);
    expect(single.instanceId?.externalId).toBe(
      timeseriesCdmInstance.externalId
    );
  });

  test('retrieve with non-existent external id', async () => {
    const res = await client.timeseries.retrieve([{ externalId: '_n/a_' }], {
      ignoreUnknownIds: true,
    });
    expect(res.length).toBe(0);
  });

  test('update', async () => {
    const newName = 'new name';
    const updateResult = await client.timeseries.update([
      {
        externalId: timeseries[0].externalId as string,
        update: {
          name: { set: newName },
        },
      },
    ]);
    expect(updateResult[0].externalId).toBe(timeseries[0].externalId);
    expect(updateResult[0].name).toBe(newName);
  });

  test('update by instance id', async () => {
    const testMetadata = { testKey: 'testValue' };
    const updateResult = await client.timeseries.update([
      {
        instanceId: timeseriesCdmInstanceId,
        update: {
          metadata: {
            set: testMetadata,
          },
        },
      },
    ]);
    expect(updateResult[0].instanceId).toEqual(timeseriesCdmInstanceId);
    expect(updateResult[0].metadata).toEqual(testMetadata);
  });

  test('connect to an asset', async () => {
    await client.timeseries.update([
      {
        externalId: timeseries[0].externalId as string,
        update: {
          assetId: { set: asset.id },
        },
      },
    ]);
  });

  test('list from assetIds', async () => {
    await runTestWithRetryWhenFailing(async () => {
      const result = await client.timeseries
        .list({ filter: { assetIds: [asset.id] } })
        .autoPagingToArray({ limit: Number.POSITIVE_INFINITY });
      expect(result.length).toBe(1);
      expect(result[0].id).toBe(createdTimeseries[0].id);
    });
  });

  test('count aggregate', async () => {
    const aggregates = await client.timeseries.aggregate({
      filter: {
        name: timeseries[0].name,
      },
    });
    expect(aggregates.length).toBe(1);
    expect(aggregates[0].count).toBeDefined();
  });

  test('list with some more filters', async () => {
    const { isString, name, unit } = timeseries[1];
    const { items } = await client.timeseries.list({
      partition: '1/2',
      filter: {
        isString,
        name,
        unit,
      },
    });
    expect(items.length).toBeGreaterThanOrEqual(0);
  });

  test('list', async () => {
    const { items } = await client.timeseries.list({
      limit: 1,
      partition: '1/10',
    });
    expect(items.length).toBeGreaterThan(0);
  });

  test('list with assetExternalIds', async () => {
    const { items } = await client.timeseries.list({
      filter: { assetExternalIds: [asset.externalId || ''] },
      limit: 1,
    });
    expect(items.length).toBe(1);
    expect(items[0].id).toBe(createdTimeseries[0].id);
  });

  test('list with assetSubtreeIds', async () => {
    const { items } = await client.timeseries.list({
      filter: { assetSubtreeIds: [{ id: asset.id }] },
      limit: 1,
    });
    expect(items.length).toBe(1);
    expect(items[0].id).toBe(createdTimeseries[0].id);
  });

  test('search', async () => {
    const name = 'timeserie6';
    const result = await client.timeseries.search({
      search: {
        name,
      },
    });
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].id).toBeDefined();
    expect(result[0].name).toBe(name);
  });

  test('delete', async () => {
    await client.timeseries.delete(createdTimeseries.map(({ id }) => ({ id })));
  });
});
