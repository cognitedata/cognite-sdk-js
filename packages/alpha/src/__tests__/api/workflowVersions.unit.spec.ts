// Copyright 2026 Cognite AS

import matches from 'lodash/matches';
import nock from 'nock';
import { beforeEach, describe, expect, test } from 'vitest';
import { mockBaseUrl } from '../../../../core/src/__tests__/testUtils';
import type { VersionUpsert } from '../../api/workflows/types';
import type CogniteClientAlpha from '../../cogniteClient';
import { setupMockableClient } from '../testUtils';

describe('Workflow versions unit test', () => {
  let client: CogniteClientAlpha;

  const versionCreateBody = {
    workflowExternalId: 'wf-1',
    version: '1',
    workflowDefinition: {
      description: 'Test version',
      tasks: [
        {
          externalId: 'task-1',
          type: 'function',
          parameters: {
            function: { externalId: 'fn-1' },
          },
        },
      ],
    },
  };

  const mockVersion = {
    ...versionCreateBody,
    workflowDefinition: {
      ...versionCreateBody.workflowDefinition,
      hash: 'abc123',
    },
    createdTime: 1716900000000,
    lastUpdatedTime: 1716900001000,
  };

  beforeEach(() => {
    client = setupMockableClient();
    nock.cleanAll();
  });

  test('list', async () => {
    const listQuery = {
      filter: {
        workflowFilters: [{ externalId: 'wf-1', version: '1' }],
      },
      limit: 10,
      cursor: 'abc',
    };

    nock(mockBaseUrl)
      .post(/\/workflows\/versions\/list$/, listQuery)
      .once()
      .reply(200, {
        items: [mockVersion],
        nextCursor: 'next',
      });

    const response = await client.workflowVersions.list(listQuery);
    expect(response.items).toHaveLength(1);
    expect(response.items[0].workflowExternalId).toBe(
      mockVersion.workflowExternalId
    );
    expect(response.nextCursor).toBe('next');
  });

  test('upsert', async () => {
    nock(mockBaseUrl)
      .post(/\/workflows\/versions$/, matches({ items: [versionCreateBody] }))
      .once()
      .reply(200, {
        items: [mockVersion],
      });

    const items = await client.workflowVersions.upsert([versionCreateBody]);

    expect(items).toHaveLength(1);
    expect(items[0].workflowExternalId).toEqual('wf-1');
    expect(items[0].version).toEqual('1');
    expect(items[0].workflowDefinition.hash).toEqual('abc123');
  });

  test('upsert surfaces warnings when the API returns them', async () => {
    const versionWithWarnings = {
      ...mockVersion,
      warnings: ['Task "task-1" has no timeout set'],
    };

    nock(mockBaseUrl)
      .post(/\/workflows\/versions$/, matches({ items: [versionCreateBody] }))
      .once()
      .reply(200, {
        items: [versionWithWarnings],
      });

    const items = await client.workflowVersions.upsert([versionCreateBody]);

    expect(items).toHaveLength(1);
    expect(items[0].warnings).toEqual(['Task "task-1" has no timeout set']);
  });

  test('upsert has no warnings when the API does not return any', async () => {
    nock(mockBaseUrl)
      .post(/\/workflows\/versions$/, matches({ items: [versionCreateBody] }))
      .once()
      .reply(200, {
        items: [mockVersion],
      });

    const items = await client.workflowVersions.upsert([versionCreateBody]);

    expect(items).toHaveLength(1);
    expect(items[0].warnings).toBeUndefined();
  });

  test('upsert data-aware version with data and validation', async () => {
    const dataAwareBody: VersionUpsert = {
      workflowExternalId: 'wf-daw',
      version: '1',
      workflowDefinition: {
        description: 'Data-aware version',
        tasks: [
          {
            externalId: 'score-task',
            type: 'functionApp',
            parameters: {
              functionApp: {
                externalId: 'my-function-app',
                path: '/items',
                method: 'GET',
              },
            },
          },
        ],
        data: {
          sources: [
            {
              externalId: 'source-assets',
              type: 'nodes' as const,
              dataSelector: {
                filter: {
                  equals: {
                    property: ['node', 'space'],
                    value: 'my-space',
                  },
                },
                sources: [
                  {
                    dataStore: {
                      type: 'view' as const,
                      space: 'my-space',
                      externalId: 'Asset',
                      version: 'v1',
                    },
                    properties: ['name', 'description'],
                  },
                ],
              },
            },
          ],
          targets: [
            {
              externalId: 'target-assets',
              type: 'nodes' as const,
              dependsOn: [{ externalId: 'score-task' }],
              dataSpec: {
                properties: [
                  {
                    dataStore: {
                      type: 'view' as const,
                      space: 'my-space',
                      externalId: 'AssetScore',
                      version: 'v1',
                    },
                    properties: ['score'],
                  },
                ],
              },
            },
          ],
        },
        validation: {
          externalId: 'score-validation',
          dependsOn: [{ externalId: 'score-task' }],
          targetExternalId: 'target-assets',
          rules: [{ property: 'confidence', operator: 'GTE', value: 0.95 }],
          flowsApp: { externalId: 'my-flows-app' },
        },
      },
    };

    const mockDataAwareVersion = {
      ...dataAwareBody,
      workflowDefinition: {
        ...dataAwareBody.workflowDefinition,
        hash: 'daw-hash-123',
      },
      createdTime: 1716900000000,
      lastUpdatedTime: 1716900001000,
    };

    nock(mockBaseUrl)
      .post(/\/workflows\/versions$/, matches({ items: [dataAwareBody] }))
      .once()
      .reply(200, {
        items: [mockDataAwareVersion],
      });

    const items = await client.workflowVersions.upsert([dataAwareBody]);

    expect(items).toHaveLength(1);
    expect(items[0].workflowExternalId).toEqual('wf-daw');
    expect(items[0].workflowDefinition.data).toBeDefined();
    expect(items[0].workflowDefinition.data?.sources).toHaveLength(1);
    expect(items[0].workflowDefinition.data?.sources[0].externalId).toEqual(
      'source-assets'
    );
    expect(items[0].workflowDefinition.data?.targets).toHaveLength(1);
    expect(items[0].workflowDefinition.data?.targets[0].externalId).toEqual(
      'target-assets'
    );
    expect(items[0].workflowDefinition.validation).toBeDefined();
    expect(items[0].workflowDefinition.validation?.externalId).toEqual(
      'score-validation'
    );
    expect(items[0].workflowDefinition.validation?.rules).toHaveLength(1);
    expect(items[0].workflowDefinition.validation?.rules[0]).toEqual({
      property: 'confidence',
      operator: 'GTE',
      value: 0.95,
    });
    expect(
      items[0].workflowDefinition.validation?.flowsApp?.externalId
    ).toEqual('my-flows-app');
  });

  test('delete', async () => {
    nock(mockBaseUrl)
      .post(/\/workflows\/versions\/delete/, {
        items: [{ workflowExternalId: 'wf-1', version: '1' }],
      })
      .once()
      .reply(200, {});

    await client.workflowVersions.delete([
      { workflowExternalId: 'wf-1', version: '1' },
    ]);
  });
});
