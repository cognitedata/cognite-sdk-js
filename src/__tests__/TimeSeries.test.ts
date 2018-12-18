// Copyright 2018 Cognite AS

import MockAdapter from 'axios-mock-adapter';
import { instance, TimeSeries, Timeseries } from '../index';

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

const timeseries: Timeseries[] = [
  {
    id: 2249121212200921,
    createdTime: 1540229293315,
    lastUpdatedTime: 1540229293315,
    name: 'Timeseries1',
    isString: false,
    metadata: {
      key1: 'value1',
      key2: 'value2',
    },
    unit: 'bar',
    isStep: false,
    description: 'Sensor1',
  },
  {
    id: 4542271324899636,
    createdTime: 1540229293315,
    lastUpdatedTime: 1540229293315,
    name: 'Timeseries2',
    isString: false,
    isStep: false,
    description: 'Sensor2',
  },
];

const requestTimeseries: Array<Partial<Timeseries>> = [
  {
    name: `Timeseries1`,
    isString: false,
    metadata: {
      key1: 'value1',
      key2: 'value2',
    },
    unit: 'bar',
    isStep: false,
    description: 'Sensor1',
  },
  {
    name: `Timeseries2`,
    description: 'Sensor2',
  },
];

describe('TimeSeries', () => {
  test('create timeseries', async () => {
    mock
      .onPost(/\/timeseries$/, {
        items: requestTimeseries,
      })
      .reply(200, {});
    await TimeSeries.create(requestTimeseries);
  });

  test('list timeseries', async () => {
    const params = {
      q: 'prefix',
      description: 'desc',
      limit: 2,
      includeMetadata: true,
      cursor: 'uBggq_boOPu2lJ7iTi9wGtt2P0Q_vM1NoJA3hr18pUM',
      assetId: 123,
      path: '123/456',
    };

    const previousCursor = 'z7w7dRasAxURbBDEbNovh3AqV5HG-U0EQFjOSUuTHwQ';
    const nextCursor = 'KRAug0mIb7VIqURPDa5Yh5wQKU3rV66KlVhYuQdCwc0';
    mock
      .onGet(/\/timeseries$/, {
        params,
      })
      .reply(200, {
        data: {
          previousCursor,
          nextCursor,
          items: timeseries,
        },
      });

    const result = await TimeSeries.list(params);
    expect(result).toEqual({
      previousCursor,
      nextCursor,
      items: timeseries,
    });
  });

  test('retrive timeseries', async () => {
    const reg = new RegExp(`/timeseries/${timeseries[0].id}$`);
    mock.onGet(reg).reply(200, {
      data: {
        items: [timeseries[0]],
      },
    });
    const result = await TimeSeries.retrieve(timeseries[0].id as number);
    expect(result).toEqual(timeseries[0]);
  });

  test('retrive multiple assets', async () => {
    mock
      .onPost(/\/timeseries\/byids$/, {
        items: timeseries.map(item => item.id),
      })
      .reply(200, {
        data: {
          items: timeseries,
        },
      });
    const result = await TimeSeries.retrieveMultiple(
      timeseries.map(item => item.id)
    );
    expect(result).toEqual(timeseries);
  });

  test('update timeseries', async () => {
    const newDescription = 'New description';
    const changes = {
      description: {
        set: newDescription,
      },
    };
    const reg = new RegExp(`/timeseries/${timeseries[0].id}/update`);
    mock
      .onPost(reg, {
        ...changes,
      })
      .reply(200, {
        data: {
          items: [
            {
              ...timeseries[0],
              description: newDescription,
            },
          ],
        },
      });

    const result = await TimeSeries.update(timeseries[0].id as number, changes);
    expect(result).toEqual({
      ...timeseries[0],
      description: newDescription,
    });
  });

  test('update multiple timeseries', async () => {
    const newDescription = 'New description';
    const changes = [
      {
        id: timeseries[0].id,
        description: {
          set: newDescription,
        },
      },
      {
        id: timeseries[1].id,
        description: {
          setNull: true,
        },
      },
    ];
    mock
      .onPost(/\/timeseries\/update$/, {
        items: changes,
      })
      .reply(200, {
        data: {
          items: [
            {
              ...timeseries[0],
              description: newDescription,
            },
            {
              ...timeseries[1],
            },
          ],
        },
      });

    const result = await TimeSeries.updateMultiple(changes);
    const expectedResult = [
      {
        ...timeseries[0],
        description: newDescription,
      },
      {
        ...timeseries[1],
      },
    ];
    expect(result).toEqual(expectedResult);
  });

  test('overwrite multiple timeseries', async () => {
    mock
      .onPut(/\/timeseries$/, {
        items: timeseries,
      })
      .reply(200, {});
    await TimeSeries.overwriteMultiple(timeseries);
  });

  test('search timeseries', async () => {
    const params = {
      metadata: { key1: 'value1' },
      assetSubtrees: [123, 456],
    };
    mock
      .onGet(/\/timeseries\/search$/, {
        params,
      })
      .reply(200, {
        data: {
          items: [timeseries[0]],
        },
      });

    const result = await TimeSeries.search(params);
    expect(result).toEqual({ items: [timeseries[0]] });
  });

  test('delete timeseries', async () => {
    const reg = new RegExp(
      `/timeseries/${encodeURIComponent(timeseries[0].name)}$`
    );
    mock.onDelete(reg).reply(200, {});
    await TimeSeries.delete(timeseries[0].name as string);
  });
});
