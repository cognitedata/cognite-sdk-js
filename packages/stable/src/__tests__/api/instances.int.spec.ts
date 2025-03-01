// Copyright 2024 Cognite AS

import type { DirectRelationReference, ViewReference } from 'stable/src/types';
import { afterAll, beforeAll, describe, expect, test, vi } from 'vitest';
import type CogniteClient from '../../cogniteClient';
import { setupLoggedInClient } from '../testUtils';

type SpaceDefinition = {
  space: string;
  name: string;
  description: string;
};

type Describable = {
  externalId: string;
  space: string;
  title: string;
  description: string;
  labels: string[];
};

type CdmDescribable = {
  space: string;
  externalId: string;
  name: string;
  description: string;
  tags: string[];
  aliases: string[];
};

type Sourcable = {
  sourceId: string;
  sourceContext: string;
  source: DirectRelationReference;
  sourceCreatedTime: string;
  sourceUpdatedTime: string;
  sourceCreatedUser: string;
  sourceUpdatedUser: string;
};

type CogniteSourceSystem = CdmDescribable & {
  version: string;
  manufacturer: string;
};

const upsertSpace = async (client: CogniteClient, space: SpaceDefinition) => {
  await client.spaces.upsert([space]);
};

const upsertDescribables = async (
  client: CogniteClient,
  describables: Describable[],
  describableView: ViewReference
) => {
  await client.instances.upsert({
    items: describables.map((describable) => ({
      instanceType: 'node',
      externalId: describable.externalId,
      space: describable.space,
      sources: [
        {
          source: describableView,
          properties: {
            title: describable.title,
            description: describable.description,
            labels: describable.labels,
          },
        },
      ],
    })),
  });
};

const upsertCogniteSourceSystem = async (
  client: CogniteClient,
  sourceSystem: CogniteSourceSystem,
  sourcableView: ViewReference
) => {
  await client.instances.upsert({
    items: [
      {
        instanceType: 'node',
        externalId: sourceSystem.externalId,
        space: sourceSystem.space,
        sources: [
          {
            source: sourcableView,
            properties: {
              name: sourceSystem.name,
              description: sourceSystem.description,
              tags: sourceSystem.tags,
              version: sourceSystem.version,
              manufacturer: sourceSystem.manufacturer,
            },
          },
        ],
      },
    ],
  });
};
const upsertSourcables = async (
  client: CogniteClient,
  sourcables: Sourcable[],
  sourcableView: ViewReference
) => {
  await client.instances.upsert({
    items: sourcables.map((sourcable) => ({
      instanceType: 'node',
      externalId: sourcable.sourceId,
      space: sourcable.sourceContext,
      sources: [
        {
          source: sourcableView,
          properties: {
            sourceId: sourcable.sourceId,
            source: sourcable.source,
            sourceContext: sourcable.sourceContext,
            sourceCreatedTime: sourcable.sourceCreatedTime,
            sourceUpdatedTime: sourcable.sourceUpdatedTime,
            sourceCreatedUser: sourcable.sourceCreatedUser,
            sourceUpdatedUser: sourcable.sourceUpdatedUser,
          },
        },
      ],
    })),
  });
};

describe('Instances integration test', () => {
  let client: CogniteClient;
  const timestamp = Date.now();
  // @cognite/sdk: Unknown Error: The value of property 'sourceUpdatedTime' must be a string in the format 'YYYY-MM-DDTHH:MM:SS[.millis][Z|time zone]' with optional milliseconds having precision of 1-3 decimal digits and optional timezone with format ±HH:MM, ±HHMM, ±HH or Z, where Z represents UTC, Year must be between 0001 and 9999. Got value '1740839823145'.
  const cdmTimeStamp = new Date().toISOString();

  const testSpace: SpaceDefinition = {
    space: 'test_data_space',
    name: 'test_data_space',
    description: 'Instance space used for integration tests.',
  };
  const describableView: ViewReference = {
    externalId: 'Describable',
    space: 'cdf_core',
    type: 'view',
    version: 'v1',
  };

  const sourcableView: ViewReference = {
    externalId: 'CogniteSourceable',
    space: 'cdf_cdm',
    type: 'view',
    version: 'v1',
  };

  const SourceSystemView: ViewReference = {
    externalId: 'CogniteSourceSystem',
    space: 'cdf_cdm',
    type: 'view',
    version: 'v1',
  };

  const describable1: Describable = {
    externalId: `describable_1_${timestamp}`,
    space: testSpace.space,
    title: `title_1_${timestamp}`,
    description: `description_1_${timestamp}`,
    labels: ['label1', 'label2'],
  };
  const describable2: Describable = {
    externalId: `describable_2_${timestamp}`,
    space: testSpace.space,
    title: `title_2_${timestamp}`,
    description: `description_2_${timestamp}`,
    labels: ['label1', 'label2'],
  };

  const sourceSystem: CogniteSourceSystem = {
    externalId: `source_system_${timestamp}`,
    space: testSpace.space,
    name: `source_system_title_${timestamp}`,
    description: `source_system_description_${timestamp}`,
    tags: ['label1', 'label2'],
    aliases: ['alias1', 'alias2'],
    version: '1.0',
    manufacturer: 'Cognite',
  };

  const source = {
    externalId: sourceSystem.externalId,
    space: sourceSystem.space,
  };

  const sourcable1: Sourcable = {
    sourceId: `sourcable_1_${timestamp}`,
    sourceContext: testSpace.space,
    source: source,
    sourceCreatedTime: cdmTimeStamp,
    sourceUpdatedTime: cdmTimeStamp,
    sourceCreatedUser: 'user1',
    sourceUpdatedUser: 'user2',
  };

  const sourcable2: Sourcable = {
    sourceId: `sourcable_2_${timestamp}`,
    sourceContext: testSpace.space,
    source: source,
    sourceCreatedTime: cdmTimeStamp,
    sourceUpdatedTime: cdmTimeStamp,
    sourceCreatedUser: 'user1',
    sourceUpdatedUser: 'user2',
  };

  beforeAll(async () => {
    client = setupLoggedInClient();
    await upsertSpace(client, testSpace);
    await upsertDescribables(
      client,
      [describable1, describable2],
      describableView
    );
    await upsertCogniteSourceSystem(client, sourceSystem, SourceSystemView);
    await upsertSourcables(client, [sourcable1, sourcable2], sourcableView);
  }, 10000);

  afterAll(async () => {
    await client.instances.delete([
      {
        instanceType: 'node',
        externalId: describable1.externalId,
        space: testSpace.space,
      },
      {
        instanceType: 'node',
        externalId: describable2.externalId,
        space: testSpace.space,
      },
      {
        instanceType: 'node',
        externalId: sourceSystem.externalId,
        space: testSpace.space,
      },
      {
        instanceType: 'node',
        externalId: sourcable1.sourceId,
        space: sourcable1.sourceContext,
      },
      {
        instanceType: 'node',
        externalId: sourcable2.sourceId,
        space: sourcable2.sourceContext,
      },
    ]);
  }, 10000);

  test('list nodes from a single describableView with limit 2', async () => {
    const response = await client.instances.list({
      sources: [{ source: describableView }],
      instanceType: 'node',
      limit: 2,
    });
    expect(response.items).toHaveLength(2);
    expect(response.items[0].externalId).toBeDefined();
    expect(response.items[1].externalId).toBeDefined();
  });

  test('list nodes with a filter that returns 1 result', async () => {
    const response = await client.instances.list({
      sources: [{ source: describableView }],
      filter: {
        equals: {
          property: ['node', 'externalId'],
          value: describable2.externalId,
        },
      },
      instanceType: 'node',
      limit: 1000,
    });
    expect(response.items).toHaveLength(1);
    expect(response.items[0].externalId).toBeDefined();
    expect(response.items[0].externalId).toBe(describable2.externalId);
  });

  test('list nodes with a filter that returns no results', async () => {
    const response = await client.instances.list({
      sources: [{ source: describableView }],
      filter: {
        equals: {
          property: ['node', 'externalId'],
          value: 'No describable has this title',
        },
      },
      instanceType: 'node',
      limit: 1000,
    });
    expect(response.items).toHaveLength(0);
  });

  test('list nodes sorted in ascending order', async () => {
    const response = await client.instances.list({
      sources: [{ source: describableView }],
      sort: [
        {
          property: [
            describableView.space,
            `${describableView.externalId}/${describableView.version}`,
            'title',
          ],
          direction: 'ascending',
          nullsFirst: false,
        },
      ],
      instanceType: 'node',
      limit: 2,
    });
    expect(response.items).toHaveLength(2);
    expect(response.items[0].externalId).toBeDefined();
    expect(response.items[1].externalId).toBeDefined();

    const title1 =
      response.items[0].properties?.[describableView.space][
        `${describableView.externalId}/${describableView.version}`
      ].title.toString() || '';
    const title2 =
      response.items[0].properties?.[describableView.space][
        `${describableView.externalId}/${describableView.version}`
      ].title.toString() || '';
    expect(title1 < title2);
  });

  test('list nodes sorted in descending order', async () => {
    const response = await client.instances.list({
      sources: [{ source: describableView }],
      sort: [
        {
          property: [
            describableView.space,
            `${describableView.externalId}/${describableView.version}`,
            'title',
          ],
          direction: 'descending',
          nullsFirst: false,
        },
      ],
      instanceType: 'node',
      limit: 2,
    });
    expect(response.items).toHaveLength(2);
    expect(response.items[0].externalId).toBeDefined();
    expect(response.items[1].externalId).toBeDefined();

    const title1 =
      response.items[0].properties?.[describableView.space][
        `${describableView.externalId}/${describableView.version}`
      ].title.toString() || '';
    const title2 =
      response.items[0].properties?.[describableView.space][
        `${describableView.externalId}/${describableView.version}`
      ].title.toString() || '';
    expect(title1 > title2);
  });

  test('search nodes with limit 2', async () => {
    await vi.waitFor(async () => {
      const response = await client.instances.search({
        view: describableView,
        instanceType: 'node',
        limit: 2,
      });
      expect(response.items).toHaveLength(2);
      expect(response.items[0].externalId).toBeDefined();
      expect(response.items[1].externalId).toBeDefined();
    }, 25_000);
  }, 25_000);

  test('search with query', async () => {
    const response = await client.instances.search({
      view: describableView,
      query: describable1.description,
      limit: 1,
    });
    expect(response.items).toHaveLength(1);
    expect(response.items[0].externalId).toBe(describable1.externalId);
  });

  test('search with filter', async () => {
    await vi.waitFor(
      async () => {
        const response = await client.instances.search({
          view: describableView,
          filter: {
            prefix: {
              property: ['title'],
              value: 'titl',
            },
          },
          limit: 1,
        });
        expect(response.items).toHaveLength(1);
        expect(response.items[0].properties);
        const title =
          response.items[0].properties?.[describableView.space][
            `${describableView.externalId}/${describableView.version}`
          ].title.toString() || '';
        expect(title.startsWith('titl'));
      },
      { interval: 1000, timeout: 25_000 }
    );
  }, 25_000);

  test('aggregate', async () => {
    const response = await client.instances.aggregate({
      view: describableView,
      groupBy: ['externalId'],
      aggregates: [{ count: { property: 'externalId' } }],
      filter: {
        prefix: {
          property: ['title'],
          value: 'titl',
        },
      },
      limit: 1,
    });

    expect(response.items).toHaveLength(1);

    expect(response.items[0].aggregates[0].aggregate).toBe('count');
    expect(
      response.items[0].aggregates[0].aggregate === 'count' &&
        (response.items[0].aggregates[0].value || 0)
    ).toBeGreaterThan(0);
  });

  test('aggregate response  with DirectRelationReference', async () => {
    const response = await client.instances.aggregate({
      view: sourcableView,
      groupBy: ['source'],
      aggregates: [{ count: { property: 'source' } }],
      filter: undefined,
    });
    expect(response.items[0].group).toEqual({
      source: { externalId: sourceSystem.externalId, space: 'test_data_space' },
    });

    expect(response.items[0].aggregates[0]).toEqual({
      aggregate: 'count',
      property: 'source',
      value: 2,
    });
  });

  test('retrieve', async () => {
    const response = await client.instances.retrieve({
      sources: [{ source: describableView }],
      items: [
        {
          externalId: describable1.externalId,
          space: testSpace.space,
          instanceType: 'node',
        },
      ],
    });
    expect(response.items).toHaveLength(1);
    expect(response.items[0].properties);
    const title =
      response.items[0].properties?.[describableView.space][
        `${describableView.externalId}/${describableView.version}`
      ].title.toString() || '';
    expect(title.startsWith('titl'));
  });

  test('query', async () => {
    const response = await client.instances.query({
      with: {
        result_set_1: {
          nodes: {
            filter: {
              equals: {
                property: ['node', 'externalId'],
                value: describable1.externalId,
              },
            },
          },
        },
      },
      select: {
        result_set_1: {},
      },
    });
    expect(response.items.result_set_1).toHaveLength(1);
  }, 10_000);

  test('sync', async () => {
    const response = await client.instances.sync({
      with: {
        result_set_1: {
          nodes: {
            filter: {
              equals: {
                property: ['node', 'externalId'],
                value: describable1.externalId,
              },
            },
          },
        },
      },
      select: {
        result_set_1: {},
      },
    });
    expect(response.items.result_set_1).toHaveLength(1);
  });
});
