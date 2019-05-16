// Copyright 2019 Cognite AS

import { API } from '../../resources/api';
import { setupClient } from '../testUtils';

describe('Events integration test', async () => {
  let client: API;
  beforeAll(async () => {
    client = await setupClient();
  });

  test('create,retrieve,update,delete', async () => {
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

    const createdEvents = await client.events.create(events);
    expect(createdEvents[0].description).toBe(events[0].description);

    const [singleEvent] = await client.events.retrieve([
      { id: createdEvents[0].id },
    ]);
    expect(singleEvent.description).toBe(events[0].description);

    // TODO: test more
    // const newDescription = 'new description';
    // const [updatedEvent] = await client.events.update([
    //   {
    //     id: createdEvents[0].id,
    //     update: {
    //       description: { set: newDescription },
    //     },
    //   },
    // ]);
    // expect(updatedEvent.id).toBe(createdEvents[0].id);
    // expect(updatedEvent.description).toBe(newDescription);

    await client.events.delete(createdEvents.map(event => ({ id: event.id })));
  });
});
