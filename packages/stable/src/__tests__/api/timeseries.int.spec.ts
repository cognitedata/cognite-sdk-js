// Copyright 2020 Cognite AS

import CogniteClient from '../../cogniteClient';
import { Asset, GetTimeSeriesMetadataDTO } from '../../types';
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
        name: 'asset_' + randomInt(),
        externalId: 'external_' + randomInt(),
      },
    ]);
  });

  afterAll(async () => {
    await client.assets.delete([{ id: asset.id }]);
  });

  const timeseries = [
    {
      name: 'timeserie1',
      externalId: 'external_' + randomInt(),
    },
    {
      name: 'timeserie2',
      unit: 'bar',
      isString: true,
    },
  ];

  let createdTimeseries: GetTimeSeriesMetadataDTO[];

  test('create', async () => {
    createdTimeseries = await client.timeseries.create(timeseries);
    expect(createdTimeseries[0].id).toBeDefined();
  });

  test('retrieve', async () => {
    const single = await client.timeseries.retrieve([
      { id: createdTimeseries[0].id },
    ]);
    expect(single[0].name).toBe(timeseries[0].name);
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
        .list({ assetIds: [asset.id] })
        .autoPagingToArray({ limit: Infinity });
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
      isString,
      name,
      unit,
    });
    expect(items.length).toBeGreaterThan(0);
  });

  test('list', async () => {
    await client.timeseries
      .list({ includeMetadata: false })
      .autoPagingToArray({ limit: 100 });
  });

  test('list partition', async () => {
    const items = await client.timeseries
      .list({ includeMetadata: false, partition: '1/10' })
      .autoPagingToArray({ limit: 100 });
    expect(items.length).toBeGreaterThan(0);
  });

  test('list with assetExternalIds', async () => {
    const { items } = await client.timeseries.list({
      assetExternalIds: [asset.externalId!],
      limit: 1,
    });
    expect(items[0].id).toBe(createdTimeseries[0].id);
  });

  test('list with assetSubtreeIds', async () => {
    const { items } = await client.timeseries.list({
      assetSubtreeIds: [{ id: asset.id }],
      limit: 1,
    });
    expect(items[0].id).toBe(createdTimeseries[0].id);
  });

  test('search', async () => {
    const name = 'test__constant_0_with_noise';
    const result = await client.timeseries.search({
      search: {
        name,
      },
    });
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].id).toBeDefined();
    expect(result[0].name).toBe(name);
  });

  test('synthetic query', async () => {
    const [ts1] = createdTimeseries;
    const result = await client.timeseries.syntheticQuery([
      {
        expression: `24 * TS{externalId='${
          ts1.externalId
        }', aggregate='average', granularity='1h'}`,
        start: '48h-ago',
        end: 'now',
        limit: 100,
      },
    ]);
    expect(result.length).toBe(1);
  });

  test('delete', async () => {
    await client.timeseries.delete(createdTimeseries.map(({ id }) => ({ id })));
  });
});
