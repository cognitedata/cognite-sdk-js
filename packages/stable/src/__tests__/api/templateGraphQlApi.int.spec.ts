// Copyright 2020 Cognite AS

import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { randomInt, setupLoggedInClient } from '../testUtils';

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
    expect(result.data.testList).toEqual([{ a: 10, b: 'test' }]);
  });
});
