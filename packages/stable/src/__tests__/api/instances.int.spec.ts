// Copyright 2024 Cognite AS

import type {
  DirectRelationReference,
  Timestamp,
  ViewReference,
} from 'stable/src/types';
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
  source: CogniteSourceSystem;
  sourceCreatedTime: Timestamp;
  sourceUpdatedTime: Timestamp;
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
  DescribableView: ViewReference
) => {
  await client.instances.upsert({
    items: describables.map((describable) => ({
      instanceType: 'node',
      externalId: describable.externalId,
      space: describable.space,
      sources: [
        {
          source: DescribableView,
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
  SourcableView: ViewReference
) => {
  await client.instances.upsert({
    items: [
      {
        instanceType: 'node',
        externalId: sourceSystem.externalId,
        space: sourceSystem.space,
        sources: [
          {
            source: SourcableView,
            properties: {
              title: sourceSystem.name,
              description: sourceSystem.description,
              labels: sourceSystem.tags,
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
  SourcableView: ViewReference
) => {
  await client.instances.upsert({
    items: sourcables.map((sourcable) => ({
      instanceType: 'node',
      externalId: sourcable.sourceId,
      space: sourcable.sourceContext,
      sources: [
        {
          source: SourcableView,
          properties: {
            sourceId: sourcable.sourceId,
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

  const testSpace: SpaceDefinition = {
    space: 'test_data_space',
    name: 'test_data_space',
    description: 'Instance space used for integration tests.',
  };
  const DescribableView: ViewReference = {
    externalId: 'Describable',
    space: 'cdf_core',
    type: 'view',
    version: 'v1',
  };

  const SourcableView: ViewReference = {
    externalId: 'Sourcable',
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

  const sourcable1: Sourcable = {
    sourceId: `sourcable_1_${timestamp}`,
    sourceContext: testSpace.space,
    source: sourceSystem,
    sourceCreatedTime: timestamp,
    sourceUpdatedTime: timestamp,
    sourceCreatedUser: 'user1',
    sourceUpdatedUser: 'user2',
  };

  const sourcable2: Sourcable = {
    sourceId: `sourcable_2_${timestamp}`,
    sourceContext: testSpace.space,
    source: sourceSystem,
    sourceCreatedTime: timestamp,
    sourceUpdatedTime: timestamp,
    sourceCreatedUser: 'user1',
    sourceUpdatedUser: 'user2',
  };

  beforeAll(async () => {
    client = setupLoggedInClient();
    await upsertSpace(client, testSpace);
    await upsertDescribables(
      client,
      [describable1, describable2],
      DescribableView
    );
    await upsertCogniteSourceSystem(client, sourceSystem, SourceSystemView);
    await upsertSourcables(client, [sourcable1, sourcable2], SourcableView);
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

  test('list nodes from a single DescribableView with limit 2', async () => {
    const response = await client.instances.list({
      sources: [{ source: DescribableView }],
      instanceType: 'node',
      limit: 2,
    });
    expect(response.items).toHaveLength(2);
    expect(response.items[0].externalId).toBeDefined();
    expect(response.items[1].externalId).toBeDefined();
  });

  test('list nodes with a filter that returns 1 result', async () => {
    const response = await client.instances.list({
      sources: [{ source: DescribableView }],
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
      sources: [{ source: DescribableView }],
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
      sources: [{ source: DescribableView }],
      sort: [
        {
          property: [
            DescribableView.space,
            `${DescribableView.externalId}/${DescribableView.version}`,
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
      response.items[0].properties?.[DescribableView.space][
        `${DescribableView.externalId}/${DescribableView.version}`
      ].title.toString() || '';
    const title2 =
      response.items[0].properties?.[DescribableView.space][
        `${DescribableView.externalId}/${DescribableView.version}`
      ].title.toString() || '';
    expect(title1 < title2);
  });

  test('list nodes sorted in descending order', async () => {
    const response = await client.instances.list({
      sources: [{ source: DescribableView }],
      sort: [
        {
          property: [
            DescribableView.space,
            `${DescribableView.externalId}/${DescribableView.version}`,
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
      response.items[0].properties?.[DescribableView.space][
        `${DescribableView.externalId}/${DescribableView.version}`
      ].title.toString() || '';
    const title2 =
      response.items[0].properties?.[DescribableView.space][
        `${DescribableView.externalId}/${DescribableView.version}`
      ].title.toString() || '';
    expect(title1 > title2);
  });

  test('search nodes with limit 2', async () => {
    await vi.waitFor(async () => {
      const response = await client.instances.search({
        view: DescribableView,
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
      view: DescribableView,
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
          view: DescribableView,
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
          response.items[0].properties?.[DescribableView.space][
            `${DescribableView.externalId}/${DescribableView.version}`
          ].title.toString() || '';
        expect(title.startsWith('titl'));
      },
      { interval: 1000, timeout: 25_000 }
    );
  }, 25_000);

  test('aggregate', async () => {
    const response = await client.instances.aggregate({
      view: DescribableView,
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
      view: DescribableView,
      groupBy: ['source'],
      aggregates: [{ count: { property: 'source' } }],
      filter: undefined,
    });
    const createdBy = response.items[0].group?.source;

    expect(createdBy).toBeDefined();
    expect(createdBy).toMatchObject<DirectRelationReference>({
      externalId: 'source',
      space: DescribableView.space,
    });
  });

  test('retrieve', async () => {
    const response = await client.instances.retrieve({
      sources: [{ source: DescribableView }],
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
      response.items[0].properties?.[DescribableView.space][
        `${DescribableView.externalId}/${DescribableView.version}`
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
