// Copyright 2026 Cognite AS

import nock from 'nock';
import { beforeEach, describe, expect, test } from 'vitest';
import type CogniteClient from '../../cogniteClient';
import type {
  ExtractionPipelineConfig,
  ExtractionPipelineConfigCreate,
  ExtractionPipelineConfigRevision,
} from '../../types';
import { mockBaseUrl, setupMockableClient } from '../testUtils';

describe('Extraction pipeline configs unit test', () => {
  let client: CogniteClient;

  const configCreate = {
    externalId: 'my-pipeline',
    config: 'logger:\n  console:\n    level: INFO\n',
    description: 'Initial configuration',
  } satisfies ExtractionPipelineConfigCreate;

  const config: ExtractionPipelineConfig = {
    ...configCreate,
    revision: 2,
    createdTime: 1730000000000,
  };

  const revision: ExtractionPipelineConfigRevision = {
    externalId: 'my-pipeline',
    revision: 1,
    createdTime: 1720000000000,
    description: null,
  };

  beforeEach(() => {
    client = setupMockableClient();
    nock.cleanAll();
  });

  test('retrieve', async () => {
    nock(mockBaseUrl)
      .get(/\/extpipes\/config$/)
      .query({ externalId: 'my-pipeline', revision: '2', activeAtTime: '0' })
      .once()
      .reply(200, config);

    const retrieved = await client.extractionPipelines.config.retrieve({
      externalId: 'my-pipeline',
      revision: 2,
      activeAtTime: 0,
    });
    expect(retrieved).toEqual(config);
  });

  test('list', async () => {
    nock(mockBaseUrl)
      .get(/\/extpipes\/config\/revisions$/)
      .query({ externalId: 'my-pipeline', limit: '10' })
      .once()
      .reply(200, { items: [revision], nextCursor: 'next' });

    const response = await client.extractionPipelines.config.list({
      externalId: 'my-pipeline',
      limit: 10,
    });
    expect({
      items: response.items,
      nextCursor: response.nextCursor,
    }).toEqual({ items: [revision], nextCursor: 'next' });
  });

  test('create', async () => {
    nock(mockBaseUrl)
      .post(/\/extpipes\/config$/, configCreate)
      .once()
      .reply(200, config);

    const created =
      await client.extractionPipelines.config.create(configCreate);
    expect(created).toEqual(config);
  });

  test('revert', async () => {
    nock(mockBaseUrl)
      .post(/\/extpipes\/config\/revert$/, {
        externalId: 'my-pipeline',
        revision: 1,
      })
      .once()
      .reply(200, { ...config, revision: 3 });

    const reverted = await client.extractionPipelines.config.revert({
      externalId: 'my-pipeline',
      revision: 1,
    });
    expect(reverted).toEqual({ ...config, revision: 3 });
  });
});
