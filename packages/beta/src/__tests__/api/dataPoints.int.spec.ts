/// Copyright 2020 Cognite AS

import CogniteClient from '../../cogniteClient';
import { Timeseries, Datapoints } from '../../types';
import { setupLoggedInClient } from '../testUtils';

const Status = {
  good: {
    code: 0,
    symbol: 'Good',
  },
  uncertain: {
    code: 1073741824,
    symbol: 'Uncertain',
  },
  bad: {
    code: 2147483648,
    symbol: 'Bad',
  },
};

describe('Datapoints integration test for quality indicators', () => {
  let client: CogniteClient;
  let timeserie: Timeseries;

  const datapoints = [
    {
      timestamp: new Date('2022-10-01T00:00:00Z'),
      value: 10,
      status: Status.good,
    },
    {
      timestamp: new Date('2022-10-02T00:00:00Z'),
      value: 20,
      status: Status.good,
    },
    {
      timestamp: new Date('2022-11-01T00:00:00Z'),
      value: 30,
      status: Status.uncertain,
    },
    {
      timestamp: new Date('2022-11-02T00:00:00Z'),
      value: 40,
      status: Status.uncertain,
    },
    {
      timestamp: new Date('2022-12-01T00:00:00Z'),
      value: 50,
      status: Status.bad,
    },
    {
      timestamp: new Date('2022-12-02T00:00:00Z'),
      value: 60,
      status: Status.bad,
    },
    {
      timestamp: new Date('2023-01-01T00:00:00Z'),
      value: 70,
      status: Status.good,
    },
    {
      timestamp: new Date('2023-01-02T00:00:00Z'),
      value: 80,
      status: Status.bad,
    },
    {
      timestamp: new Date('2023-03-01T00:00:00Z'),
      value: 90,
      status: Status.good,
    },
    {
      timestamp: new Date('2023-03-02T00:00:00Z'),
      value: 100,
      status: Status.uncertain,
    },
  ];

  beforeAll(async () => {
    client = setupLoggedInClient();
    [timeserie] = await client.timeseries.create([{ name: 'tmp' }]);
    await client.datapoints.insert([
      {
        id: timeserie.id,
        datapoints: datapoints,
      },
    ]);
  });
  afterAll(async () => {
    await client.timeseries.delete([{ id: timeserie.id }]);
  });

  test('retrieve aggregates with correct data point status counts', async () => {
    const response = await client.datapoints.retrieveDatapointMonthlyAggregates(
      {
        items: [{ id: timeserie.id, includeStatus: true }],
        start: new Date(2020, 0, 1),
        end: new Date(2023, 3, 1),
        aggregates: ['countGood', 'countUncertain', 'countBad'],
      }
    );

    expect(response[0].datapoints[0].countGood).toBe(2);
    expect(response[0].datapoints[0].countUncertain).toBe(0);
    expect(response[0].datapoints[0].countBad).toBe(0);

    expect(response[0].datapoints[1].countGood).toBe(0);
    expect(response[0].datapoints[1].countUncertain).toBe(2);
    expect(response[0].datapoints[1].countBad).toBe(0);

    expect(response[0].datapoints[2].countGood).toBe(0);
    expect(response[0].datapoints[2].countUncertain).toBe(0);
    expect(response[0].datapoints[2].countBad).toBe(2);

    expect(response[0].datapoints[3].countGood).toBe(1);
    expect(response[0].datapoints[3].countUncertain).toBe(0);
    expect(response[0].datapoints[3].countBad).toBe(1);

    expect(response[0].datapoints[4].countGood).toBe(1);
    expect(response[0].datapoints[4].countUncertain).toBe(1);
    expect(response[0].datapoints[4].countBad).toBe(0);
  });

  test('retrieve datapoints with status code', async () => {
    const response = (await client.datapoints.retrieve({
      items: [
        {
          id: timeserie.id,
          start: new Date('2022-10-01T00:00:00Z'),
          end: new Date('2023-04-01T00:00:00Z'),
          includeStatus: true,
          ignoreBadDataPoints: false,
          treatUncertainAsBad: false,
        },
      ],
    })) as Datapoints[];

    // Good data points omits status
    expect(response[0].datapoints[0].status).toBeUndefined();
    expect(response[0].datapoints[1].status).toBeUndefined();
    expect(response[0].datapoints[2].status).toEqual(Status.uncertain);
    expect(response[0].datapoints[3].status).toEqual(Status.uncertain);
    expect(response[0].datapoints[4].status).toEqual(Status.bad);
    expect(response[0].datapoints[5].status).toEqual(Status.bad);
    expect(response[0].datapoints[6].status).toBeUndefined();
    expect(response[0].datapoints[7].status).toEqual(Status.bad);
    expect(response[0].datapoints[8].status).toBeUndefined();
    expect(response[0].datapoints[9].status).toEqual(Status.uncertain);
  });
});
