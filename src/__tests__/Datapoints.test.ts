// Copyright 2018 Cognite AS

import MockAdapter from 'axios-mock-adapter';
import { Datapoint, Datapoints, instance } from '../index';

let mock: MockAdapter;

beforeAll(() => {
  mock = new MockAdapter(instance);
});

afterAll(() => {
  mock.restore();
});

afterEach(() => {
  // cleaning up the mess left behind the previous test
  mock.reset();
});

const datapoints: Datapoint[] = [
  {
    timestamp: 10,
    value: -10,
  },
  {
    timestamp: 100,
    value: 50,
  },
  {
    timestamp: 200,
    value: 100,
  },
];

describe('Datapoints', () => {
  test('insert datapoints', async () => {
    mock
      .onPost(/\/timeseries\/12345\/data$/, {
        items: datapoints,
      })
      .reply(200, {});
    await Datapoints.insert(12345, datapoints);
  });

  test('insert datapoints by name', async () => {
    const name = 'Cognite is awesome!';
    const reg = new RegExp(`/timeseries/data/${encodeURIComponent(name)}$`);
    mock
      .onPost(reg, {
        items: datapoints,
      })
      .reply(200, {});
    await Datapoints.insertByName(name, datapoints);
  });

  test('insert multiple datapoints', async () => {
    const params = [
      {
        name: 'first',
        datapoints,
      },
      {
        name: 'seconds',
        datapoints,
      },
    ];
    mock
      .onPost(/\/timeseries\/data$/, {
        items: params,
      })
      .reply(200, {});

    await Datapoints.insertMultiple(params);
  });

  test('retrive datapoints', async () => {
    const params = {
      aggregates: 'avg,max',
      granularity: '12h',
      includeOutsidePoints: false,
    };
    const reg = new RegExp(`/timeseries/123/data$`);
    mock
      .onGet(reg, {
        data: {
          items: datapoints,
        },
      })
      .reply(200, {
        data: {
          items: [
            {
              name: 'Cognite',
              datapoints,
            },
          ],
        },
      });

    const result = await Datapoints.retrieve(123, params);
    expect(result).toEqual({
      name: 'Cognite',
      datapoints,
    });
  });

  test('retrieve datapoints by name', async () => {
    const params = {
      aggregates: 'avg,max',
      granularity: '12h',
      includeOutsidePoints: false,
    };
    const name = 'sensor abc';
    const reg = new RegExp(`/timeseries/data/${encodeURIComponent(name)}$`);
    mock
      .onGet(reg, {
        data: {
          items: datapoints,
        },
      })
      .reply(200, {
        data: {
          items: [
            {
              name: 'Cognite',
              datapoints,
            },
          ],
        },
      });

    const result = await Datapoints.retrieveByName(name, params);
    expect(result).toEqual({
      name: 'Cognite',
      datapoints,
    });
  });

  test('retrive multiple datapoints', async () => {
    const params = {
      items: [
        {
          name: 'first',
        },
        {
          name: 'second',
        },
      ],
      aggregates: 'avg,max',
      granularity: '12h',
      includeOutsidePoints: false,
    };
    mock.onPost(/\/timeseries\/dataquery$/, params).reply(200, {
      data: {
        items: [
          {
            name: 'first',
            datapoints,
          },
          {
            name: 'second',
            datapoints,
          },
        ],
      },
    });

    const result = await Datapoints.retrieveMultiple(params);
    expect(result).toEqual([
      {
        name: 'first',
        datapoints,
      },
      {
        name: 'second',
        datapoints,
      },
    ]);
  });

  test('retrive latest datapoint', async () => {
    mock
      .onGet(/\/timeseries\/latest\/Cognite$/, {
        before: 400,
      })
      .reply(200, {
        data: {
          items: [
            {
              name: 'Cognite',
              datapoints,
            },
          ],
        },
      });
    const result = await Datapoints.retrieveLatest('Cognite');
    expect(result).toEqual(datapoints);
  });

  test('retrive datapoints as csv', async () => {
    const params = {
      items: [
        {
          name: 'cognite',
        },
      ],
      granularity: '1second',
      aggregates: ['avg', 'sum'],
    };

    mock
      .onPost(/\/timeseries\/dataframe$/, params)
      .reply(200, 'timestamp","cognite|average","cognite|sum');
    const result = await Datapoints.retrieveCSV(params);
    expect(result).toBe('timestamp","cognite|average","cognite|sum');
  });

  test('delete single datapoint', async () => {
    const name = 'cognite is awesome!';
    const reg = new RegExp(
      `/timeseries/data/${encodeURIComponent(name)}/deletesingle$`
    );
    mock.onDelete(reg, { timestamp: 123 }).reply(200, {});
    await Datapoints.delete(name, 123);
  });

  test('delete datapoint range', async () => {
    const name = 'cognite is awesome!';
    const reg = new RegExp(
      `/timeseries/data/${encodeURIComponent(name)}/deleterange$`
    );
    mock
      .onDelete(reg, {
        timestampInclusiveBegin: 30,
        timestampExclusiveEnd: 210,
      })
      .reply(200, {});
    await Datapoints.deleteRange(name, 30, 210);
  });
});
