// Copyright 2019 Cognite AS

import CogniteClient from '../../cogniteClient';
import { Asset, CogniteEvent, SortOrder } from '../../types/types';
import { setupLoggedInClient } from '../testUtils';

describe('Events integration test', () => {
  let client: CogniteClient;
  let asset: Asset;
  beforeAll(async () => {
    client = setupLoggedInClient();
    [asset] = await client.assets.create([{ name: 'Test-asset' }]);
  });

  afterAll(async () => {
    await client.assets.delete([{ id: asset.id }]);
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
      type: 'ACTION',
      subtype: 'POKE',
    },
  ];
  const newDescription = 'New description';

  let createdEvents: CogniteEvent[];

  test('create', async () => {
    createdEvents = await client.events.create(events);
    expect(createdEvents[0].description).toBe(events[0].description);
    expect(createdEvents[1].type).toBe(events[1].type);
    expect(createdEvents[1].subtype).toBe(events[1].subtype);
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

  test('list with partitions', async () => {
    const response = await client.events.list({ partition: '1/10', limit: 10 });
    expect(response.items.length).toBeGreaterThan(0);
  });

  test('list with sorting', async () => {
    await client.events.list({ sort: { createdTime: 'asc' } });
    await client.events.list({ sort: { endTime: SortOrder.DESC } });
    await expect(
      client.events.list({
        sort: {
          startTime: 'asc',
          lastUpdatedTime: 'desc',
        },
      })
    ).rejects.toThrowError();
  });

  test('list to json|string', async () => {
    const response = await client.events.list({ limit: 2 });
    expect(typeof JSON.stringify(response.items)).toBe('string');
  });

  test('list with rootAssetIds', async () => {
    const response = await client.events
      .list({
        filter: {
          rootAssetIds: [{ id: asset.id }],
        },
        limit: 1,
      })
      .autoPagingToArray({ limit: 1 });
    expect(response.length).toBe(0); // no events attached to the asset
  });

  test('search with rootAssetIds', async () => {
    const response = await client.events.search({
      filter: {
        rootAssetIds: [{ id: asset.id }],
      },
      limit: 1,
    });
    expect(response.length).toBe(0); // no events attached to the asset
  });
});
