// Copyright 2019 Cognite AS

import { API } from '../../resources/api';
import { GetTimeSeriesMetadataDTO } from '../../types/types';
import { randomInt, setupClient } from '../testUtils';

describe('Timeseries integration test', () => {
  let client: API;
  beforeAll(async () => {
    client = setupClient();
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

  test('delete', async () => {
    await client.timeseries.delete(
      createdTimeseries.map(timeserie => ({ id: timeserie.id }))
    );
  });

  test('list', async () => {
    await client.timeseries
      .list({ includeMetadata: false })
      .autoPagingToArray({ limit: 100 });
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
});
