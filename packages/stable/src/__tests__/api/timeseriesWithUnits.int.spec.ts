// Copyright 2023 Cognite AS

import CogniteClient from '../../cogniteClient';
import {
  DatapointAggregates,
  Datapoints,
  DoubleDatapoint,
  ExternalTimeseries,
  Timeseries,
} from '@cognite/sdk';
import { setupLoggedInClient } from '../testUtils';
import { randomInt, runTestWithRetryWhenFailing } from '../testUtils';

describe('Timeseries integration test', () => {
  const client: CogniteClient | null = setupLoggedInClient();

  const timeseries: ExternalTimeseries = {
    name: 'time_series_with_typed_unit',
    externalId: 'ts_with_typed_unit' + randomInt(),
    unitExternalId: 'temperature:deg_f',
  };

  let createdTimeseries: Timeseries;

  test('client is initialized', () => {
    expect(client).not.toBeNull();
  });

  test('create', async () => {
    [createdTimeseries] = await client!.timeseries.create([timeseries]);
    expect(createdTimeseries.unitExternalId).toBe(timeseries.unitExternalId);
  });

  test('update', async () => {
    const newUnitExternalId = 'temperature:deg_c';
    const [updateResult] = await client!.timeseries.update([
      {
        id: createdTimeseries.id,
        update: {
          unitExternalId: { set: newUnitExternalId },
        },
      },
    ]);
    expect(updateResult.unitExternalId).toBe(newUnitExternalId);
  });

  test('list with filter by unitExternalId', async () => {
    await runTestWithRetryWhenFailing(async () => {
      const { items } = await client!.timeseries.list({
        filter: {
          unitExternalId: 'temperature:deg_c',
        },
      });
      expect(items.length).toBeGreaterThan(0);
      expect(items[0].unitExternalId).toBe('temperature:deg_c');
    });
  });

  test('retrieve', async () => {
    const [retrievedTimeseries] = await client!.timeseries.retrieve([
      { id: createdTimeseries.id },
    ]);
    expect(retrievedTimeseries.unitExternalId).toBe('temperature:deg_c');
  });

  test('insert datapoints and request a different unit', async () => {
    const datapoints = [
      {
        timestamp: new Date(),
        value: 100,
      },
    ];
    await client?.datapoints.insert([{ id: createdTimeseries.id, datapoints }]);

    const resAggregate = (await client!.datapoints.retrieve({
      items: [
        {
          id: createdTimeseries.id,
          targetUnit: 'temperature:deg_f',
          aggregates: ['min'],
          granularity: '1d',
        },
      ],
    })) as DatapointAggregates[];
    expect(resAggregate.length).toBe(1);
    expect(resAggregate[0].datapoints[0].min).toBe(212);

    const res = (await client!.datapoints.retrieve({
      items: [{ id: createdTimeseries.id, targetUnit: 'temperature:deg_f' }],
    })) as Datapoints[];

    expect(res.length).toBe(1);
    expect(res[0].datapoints[0].value).toBe(212);
  });

  test('request a different unit system', async () => {
    const datapoints = [
      {
        timestamp: new Date(),
        value: 100,
      },
    ];
    await client?.datapoints.insert([{ id: createdTimeseries.id, datapoints }]);

    const res = await client!.datapoints.retrieve({
      items: [{ id: createdTimeseries.id, targetUnitSystem: 'SI' }],
    });
    expect(res.length).toBe(1);
    expect((res[0].datapoints[0] as DoubleDatapoint).value).toBe(373.15);
  });

  test('delete', async () => {
    await client!.timeseries.delete([{ id: createdTimeseries.id }]);
  });
});
