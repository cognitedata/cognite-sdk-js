// Copyright 2019 Cognite AS

import { API } from '../../resources/api';
import { CogniteEvent } from '../../types/types';
import { setupClient } from '../testUtils';

describe('Events integration test', () => {
  let client: API;
  beforeAll(async () => {
    client = setupClient();
  });

  const events = [
    {
      description: 'Test event',
      startTime: 10,
      endTime: 100,
    },
    {
      startTime: new Date('1 jan 2016').getTime(),
      source: 'WORKMATE',
    },
  ];
  const newDescription = 'New description';

  let createdEvents: CogniteEvent[];

  test('create', async () => {
    createdEvents = await client.events.create(events);
    expect(createdEvents[0].description).toBe(events[0].description);
  });

  test('retrieve', async () => {
    const [singleEvent] = await client.events.retrieve([
      { id: createdEvents[0].id },
    ]);
    expect(singleEvent.description).toBe(events[0].description);
  });

  test('update', async () => {
    const response = await client.events.update([
      {
        id: createdEvents[0].id,
        update: {
          description: { set: newDescription },
        },
      },
    ]);
    expect(response[0].description).toBe(newDescription);
  });

  test('delete', async () => {
    await client.events.delete(createdEvents.map(event => ({ id: event.id })));
  });

  test('search', async () => {
    const response = await client.events.search({
      search: {
        description: newDescription,
      },
    });
    expect(response.length).toBeDefined(); // we can't check content because of eventual consistency
  });

  test('list', async () => {
    const response = await client.events
      .list({
        filter: {
          startTime: {
            min: events[0].startTime - 1,
            max: events[0].endTime! + 1,
          },
        },
        limit: 3,
      })
      .autoPagingToArray({ limit: 5 });
    expect(response.length).toBeGreaterThan(0);
  });
});
