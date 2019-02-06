// Copyright 2018 Cognite AS

import MockAdapter from 'axios-mock-adapter';
import { Event, Events, instance } from '../index';

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

const events: Event[] = [
  {
    id: 7111115129601917,
    assetIds: [],
    createdTime: 1540273883161,
    lastUpdatedTime: 1540273883161,
  },
  {
    id: 3780481718530449,
    startTime: 100,
    endTime: 1000,
    description: 'Desc',
    type: 'Failure',
    subtype: 'electrical',
    assetIds: [71583811274669, 8014486409920710],
    source: 'sourceStr',
    sourceId: 'sourceId',
    createdTime: 1540274105413,
    lastUpdatedTime: 1540274105413,
  },
];

const requestEvents: Partial<Event>[] = [
  {},
  {
    startTime: 100,
    endTime: 1000,
    description: 'Desc',
    type: 'Failure',
    subtype: 'electrical',
    assetIds: [8014486409920710, 71583811274669],
    source: 'sourceStr',
    sourceId: 'sourceId',
  },
];

describe('Events', () => {
  test('create events', async () => {
    mock
      .onPost(/\/events$/, {
        items: requestEvents,
      })
      .reply(200, {
        data: {
          items: events,
        },
      });
    const result = await Events.create(requestEvents);
    expect(result).toEqual(events);
  });

  test('retrive event', async () => {
    const reg = new RegExp(`/events/${events[0].id}$`);
    mock.onGet(reg).reply(200, {
      data: {
        items: [events[0]],
      },
    });

    const result = await Events.retrieve(events[0].id);
    expect(result).toEqual(events[0]);
  });

  test('retrive multiple events', async () => {
    mock
      .onPost(/\/events\/byids$/, {
        items: events.map(item => item.id),
      })
      .reply(200, {
        data: {
          items: events,
        },
      });
    const result = await Events.retrieveMultiple(events.map(item => item.id));
    expect(result).toEqual(events);
  });

  test('update events', async () => {
    mock
      .onPost(/\/events\/update$/, {
        items: events,
      })
      .reply(200, {});
    await Events.update(events);
  });

  test('delete events', async () => {
    mock
      .onPost(/\/events\/delete$/, {
        items: events.map(item => item.id),
      })
      .reply(200, {});
    await Events.delete(events.map(item => item.id));
  });

  test('list events', async () => {
    const params = {
      type: 'failure',
      cursor: 'abc',
      limit: 10,
      hasDescription: true,
    };
    mock.onGet(/\/events$/, { params }).reply(200, {
      data: {
        previousCursor: 'prevCrs',
        nextCursor: 'nxtCrs',
        items: [events[1]],
      },
    });
    const result = await Events.list(params);
    expect(result).toEqual({
      previousCursor: 'prevCrs',
      nextCursor: 'nxtCrs',
      items: [events[1]],
    });
  });

  test('search events', async () => {
    const params = {
      type: 'failure',
      assetIds: [123, 456],
      offset: 10,
    };
    mock
      .onGet(/\/events\/search$/, {
        params,
      })
      .reply(200, {
        data: {
          items: [events[0]],
        },
      });
    const result = await Events.search(params);
    expect(result).toEqual({ items: [events[0]] });
  });
});
