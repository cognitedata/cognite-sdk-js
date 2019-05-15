// Copyright 2019 Cognite AS

import { API } from '../../resources/api';
import { setupClient } from '../testUtils';

describe('Timeseries integration test', async () => {
  let client: API;
  beforeAll(async () => {
    client = await setupClient();
    jest.setTimeout(15 * 1000);
  });

  const timeseries = [
    {
      name: 'timeserie1',
      externalId: 'external_' + Math.random(),
    },
    {
      name: 'timeserie2',
      unit: 'bar',
      isString: true,
    },
  ];

  test('create,retrieve,update,delete', async () => {
    const result = await client.timeseries.create(timeseries);
    const single = await client.timeseries.retrieve([{ id: result[0].id }]);
    expect(single[0].name).toBe(timeseries[0].name);
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

    await client.timeseries.delete(
      result.map(timeserie => ({ id: timeserie.id }))
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
