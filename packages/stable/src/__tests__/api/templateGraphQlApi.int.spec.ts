// Copyright 2020 Cognite AS

// @ts-nocheck

import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  test,
} from 'vitest';
import { randomInt } from '../../../../core/src/__tests__/testUtils';
import type CogniteClient from '../../cogniteClient';
import type { ExternalTemplateInstance } from '../../types';
import { setupLoggedInClient } from '../testUtils';

describe.skip('template group test', () => {
  let client: CogniteClient;

  const externalId = `GraphQlTest ${randomInt()}`;
  const instances: ExternalTemplateInstance[] = [
    {
      externalId: 'foo',
      templateName: 'Test',
      fieldResolvers: {
        a: 10,
        b: 'test',
      },
    },
  ];

  const templateGroups = [
    {
      externalId,
      description: 'Models a Well system',
      owners: [],
    },
  ];

  const cleanup = async () => {
    await client.templates.groups.delete(templateGroups, {
      ignoreUnknownIds: true,
    });
  };

  beforeAll(async () => {
    client = setupLoggedInClient();
    await cleanup();
    await client.templates.groups.upsert(templateGroups);
    await client.templates.group(externalId).versions.upsert({
      schema: `
      type Test @template {
        a: Int
        b: String
      }
      `,
    });
    await client.templates
      .group(externalId)
      .version(1)
      .instances.upsert(instances);
  });

  afterAll(async () => {
    await cleanup();
  });

  it('should run a GraphQL query', async () => {
    type Result = {
      testList: { a: number; b: string }[];
    };
    const result = await client.templates
      .group(externalId)
      .version(1)
      .runQuery({
        query: `
      {
        testList {
          a
          b
        }
      }`,
      });
    expect((result.data as Result).testList).toEqual([{ a: 10, b: 'test' }]);
  });
});
