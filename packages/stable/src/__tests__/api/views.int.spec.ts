// Copyright 2024 Cognite AS

import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import type { ViewCreateDefinition } from '../../api/views/types.gen';
import type CogniteClient from '../../cogniteClient';
import { deleteOldSpaces, randomInt, setupLoggedInClient } from '../testUtils';

describe('Views integration test', () => {
  let client: CogniteClient;

  const TEST_SPACE_NAME = `Views_integration_test_${randomInt()}`;
  const TEST_CONTAINER_NAME = `Views_integration_test_container${randomInt()}`;
  const TEST_RECORD_CONTAINER_NAME = `Views_integration_test_record_container${randomInt()}`;
  // Persistent stream shared with the streams/records integration suites.
  const RECORD_STREAM_ID = 'sdk_test_immutable_stream';

  const viewCreationDefinition: ViewCreateDefinition = {
    externalId: `test_view_${randomInt()}`,
    space: TEST_SPACE_NAME,
    name: 'test_view',
    description: 'View used for integration tests.',
    version: '1',
    properties: {
      test: {
        container: {
          type: 'container',
          externalId: TEST_CONTAINER_NAME,
          space: TEST_SPACE_NAME,
        },
        containerPropertyIdentifier: 'test',
      },
    },
  };
  const viewCreationDefinition2: ViewCreateDefinition = {
    externalId: 'test_view_2',
    space: TEST_SPACE_NAME,
    name: 'test_data_space_2',
    description: 'Instance space used for integration tests.',
    version: '1',
    properties: {
      test: {
        container: {
          type: 'container',
          externalId: TEST_CONTAINER_NAME,
          space: TEST_SPACE_NAME,
        },
        containerPropertyIdentifier: 'test',
      },
    },
  };

  const recordViewCreationDefinition: ViewCreateDefinition = {
    externalId: `test_record_view_${randomInt()}`,
    space: TEST_SPACE_NAME,
    name: 'test_record_view',
    description: 'Record view used for integration tests.',
    version: '1',
    streamId: [RECORD_STREAM_ID],
    filter: {
      and: [
        {
          exists: {
            property: [
              TEST_SPACE_NAME,
              TEST_RECORD_CONTAINER_NAME,
              'temperature',
            ],
          },
        },
        {
          range: {
            property: [
              TEST_SPACE_NAME,
              TEST_RECORD_CONTAINER_NAME,
              'temperature',
            ],
            gte: 0,
          },
        },
      ],
    },
    properties: {
      temperature: {
        container: {
          type: 'container',
          externalId: TEST_RECORD_CONTAINER_NAME,
          space: TEST_SPACE_NAME,
        },
        containerPropertyIdentifier: 'temperature',
      },
    },
  };

  beforeAll(async () => {
    client = setupLoggedInClient();
    vi.setConfig({ testTimeout: 30 * 1000 });
    await deleteOldSpaces(client);
    await client.spaces.upsert([
      {
        space: TEST_SPACE_NAME,
        name: TEST_SPACE_NAME,
        description: 'Instance space used for views integration tests.',
      },
    ]);
    await client.containers.upsert([
      {
        externalId: TEST_CONTAINER_NAME,
        space: TEST_SPACE_NAME,
        name: TEST_CONTAINER_NAME,
        description: 'Instance space used for views integration tests.',
        properties: {
          test: {
            type: { type: 'text' },
          },
        },
      },
    ]);

    // Reuse the persistent stream shared with the streams/records suites rather
    // than creating a per-run one.
    try {
      await client.streams.retrieve({ externalId: RECORD_STREAM_ID });
    } catch {
      await client.streams.create({
        externalId: RECORD_STREAM_ID,
        settings: { template: { name: 'ImmutableTestStream' } },
      });
    }
    await client.containers.upsert([
      {
        externalId: TEST_RECORD_CONTAINER_NAME,
        space: TEST_SPACE_NAME,
        name: TEST_RECORD_CONTAINER_NAME,
        description: 'Record container used for views integration tests.',
        usedFor: 'record',
        properties: {
          temperature: {
            type: { type: 'float64' },
          },
        },
      },
    ]);
    // Raised from 25s: this hook also provisions a stream and a record container.
  }, 60_000);
  afterAll(async () => {
    // The record view must go before the container it maps.
    await client.views
      .delete([
        {
          externalId: recordViewCreationDefinition.externalId,
          space: TEST_SPACE_NAME,
          version: '1',
        },
      ])
      .catch(() => {});
    await client.containers
      .delete([
        { externalId: TEST_RECORD_CONTAINER_NAME, space: TEST_SPACE_NAME },
      ])
      .catch(() => {});
    await client.containers.delete([
      { externalId: TEST_CONTAINER_NAME, space: TEST_SPACE_NAME },
    ]);
  }, 40_000);

  it('should successfully upsert views', async () => {
    const createdViewResponse = await client.views.upsert([
      viewCreationDefinition,
      viewCreationDefinition2,
    ]);

    expect(createdViewResponse.items).toHaveLength(2);
    expect(createdViewResponse.items[0].name).toEqual(
      viewCreationDefinition.name
    );
    expect(createdViewResponse.items[0].externalId).toEqual(
      viewCreationDefinition.externalId
    );
    expect(createdViewResponse.items[1].name).toEqual(
      viewCreationDefinition2.name
    );
    expect(createdViewResponse.items[1].externalId).toEqual(
      viewCreationDefinition2.externalId
    );
  });

  it('should successfully list Views', async () => {
    const views = await client.views.list({ limit: 1000 });
    const view1 = views.items.find(
      (view) => view.externalId === viewCreationDefinition.externalId
    );
    const view2 = views.items.find(
      (view) => view.externalId === viewCreationDefinition2.externalId
    );
    expect(view1).toBeDefined();
    expect(view2).toBeDefined();
  });

  it('should successfully list global Views', async () => {
    const views = await client.views.list({
      includeGlobal: true,
      limit: 1000,
    });
    const globalView = views.items.find((view) => view.isGlobal);
    expect(globalView).toBeDefined();
  });

  it('should successfully list Views via cursor', async () => {
    const Views = await client.views
      .list({
        includeGlobal: true,
        limit: 1,
      })
      .autoPagingToArray({ limit: 2 });
    expect(Views.length).toBeGreaterThanOrEqual(2);
  });

  it('should successfully retrieve Views', async () => {
    const views = await client.views.retrieve([
      {
        space: TEST_SPACE_NAME,
        externalId: viewCreationDefinition.externalId,
      },
      {
        space: TEST_SPACE_NAME,
        externalId: viewCreationDefinition2.externalId,
      },
    ]);
    expect(views.items.length).toBe(2);
    expect(views.items[0].name).toEqual(viewCreationDefinition.name);
    expect(views.items[1].name).toEqual(viewCreationDefinition2.name);
  });

  it('should successfully upsert a record view', async () => {
    const response = await client.views.upsert([recordViewCreationDefinition]);

    expect(response.items).toHaveLength(1);
    const created = response.items[0];
    expect(created.externalId).toEqual(recordViewCreationDefinition.externalId);
    expect(created.usedFor).toBe('record');

    expect(created.streamId).toEqual([RECORD_STREAM_ID]);
    expect(created.mappedContainers).toHaveLength(1);
    expect(created.mappedContainers[0].externalId).toEqual(
      TEST_RECORD_CONTAINER_NAME
    );
  });

  it('should exclude record views from list by default', async () => {
    const views = await client.views.list({
      space: TEST_SPACE_NAME,
      limit: 1000,
    });

    expect(
      views.items.find(
        (view) => view.externalId === recordViewCreationDefinition.externalId
      )
    ).toBeUndefined();
    expect(
      views.items.find(
        (view) => view.externalId === viewCreationDefinition.externalId
      )
    ).toBeDefined();
  });

  it('should list only record views with usedFor filter', async () => {
    const views = await client.views.list({
      space: TEST_SPACE_NAME,
      usedFor: ['record'],
      limit: 1000,
    });

    expect(views.items.every((view) => view.usedFor === 'record')).toBe(true);
    expect(
      views.items.find(
        (view) => view.externalId === recordViewCreationDefinition.externalId
      )
    ).toBeDefined();
  });

  it('should list both regular and record views with multiple usedFor values', async () => {
    const views = await client.views.list({
      space: TEST_SPACE_NAME,
      usedFor: ['node', 'edge', 'all', 'record'],
      limit: 1000,
    });

    expect(
      views.items.find(
        (view) => view.externalId === recordViewCreationDefinition.externalId
      )
    ).toBeDefined();
    expect(
      views.items.find(
        (view) => view.externalId === viewCreationDefinition.externalId
      )
    ).toBeDefined();
    expect(views.items.some((view) => view.usedFor === 'record')).toBe(true);
    expect(views.items.some((view) => view.usedFor !== 'record')).toBe(true);
  });

  it('should successfully retrieve a record view', async () => {
    const views = await client.views.retrieve([
      {
        space: TEST_SPACE_NAME,
        externalId: recordViewCreationDefinition.externalId,
        version: '1',
      },
    ]);

    expect(views.items).toHaveLength(1);
    const retrieved = views.items[0];
    expect(retrieved.usedFor).toBe('record');
    expect(retrieved.streamId).toEqual([RECORD_STREAM_ID]);
    // The filter must round-trip unchanged.
    expect(retrieved.filter).toEqual(recordViewCreationDefinition.filter);
  });

  it('should successfully delete a record view', async () => {
    const response = await client.views.delete([
      {
        space: TEST_SPACE_NAME,
        externalId: recordViewCreationDefinition.externalId,
        version: '1',
      },
    ]);
    expect(response.items).toHaveLength(1);

    // Eventual consistency - wait for the delete to propagate.
    await vi.waitFor(
      async () => {
        const views = await client.views.list({
          space: TEST_SPACE_NAME,
          usedFor: ['record'],
          limit: 1000,
        });
        expect(
          views.items.find(
            (view) =>
              view.externalId === recordViewCreationDefinition.externalId
          )
        ).toBeUndefined();
      },
      { timeout: 25 * 1000, interval: 1000 }
    );
  }, 30_000);

  it.skip('should successfully delete Views', async () => {
    const response = await client.views.delete([
      {
        space: TEST_SPACE_NAME,
        externalId: viewCreationDefinition.externalId,
        version: '1',
      },
      {
        space: TEST_SPACE_NAME,
        externalId: viewCreationDefinition2.externalId,
        version: '1',
      },
    ]);
    expect(response.items).toHaveLength(2);

    // Eventual consistency - wait for the delete to propagate
    await new Promise((resolve) => setTimeout(resolve, 20 * 1000));

    const views = await client.views.list({ limit: 1000 });
    expect(
      views.items.find(
        (view) => view.externalId === viewCreationDefinition.externalId
      )
    ).toBeUndefined();
    expect(
      views.items.find(
        (view) => view.externalId === viewCreationDefinition2.externalId
      )
    ).toBeUndefined();
  });
});
