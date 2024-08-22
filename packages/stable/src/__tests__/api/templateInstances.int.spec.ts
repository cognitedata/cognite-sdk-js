// Copyright 2020 Cognite AS

// @ts-nocheck

import { randomInt } from '@cognite/sdk-core/src/__tests__/testUtils';
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
import type CogniteClient from '../../cogniteClient';
import type { ExternalTemplateInstance, TemplateInstance } from '../../types';
import { setupLoggedInClient } from '../testUtils';

describe('template instances test', () => {
  let client: CogniteClient;

  const externalId = `TemplateInstanceTest ${randomInt()}`;
  const expectedInstances: ExternalTemplateInstance[] = [
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
  });

  afterAll(async () => {
    await cleanup();
  });

  it('should create template instances', async () => {
    const result = await client.templates
      .group(externalId)
      .version(1)
      .instances.create(expectedInstances);
    expect(result.map(toExternalTemplateInstance)).toEqual(expectedInstances);
  });

  it('should upsert template instances', async () => {
    const result = await client.templates
      .group(externalId)
      .version(1)
      .instances.upsert(expectedInstances);
    expect(result.map(toExternalTemplateInstance)).toEqual(expectedInstances);
  });

  it('should list template instances', async () => {
    const result = await client.templates
      .group(externalId)
      .version(1)
      .instances.list({
        filter: {
          templateNames: ['Test'],
        },
      })
      .autoPagingToArray({ limit: -1 });
    expect(result.map(toExternalTemplateInstance)).toEqual(expectedInstances);
  });

  it('should retrieve template instances', async () => {
    const result = await client.templates
      .group(externalId)
      .version(1)
      .instances.retrieve([{ externalId: 'foo' }, { externalId: 'bar' }], {
        ignoreUnknownIds: true,
      });
    expect(result.map(toExternalTemplateInstance)).toEqual(expectedInstances);
  });

  it('should update template instances with add', async () => {
    const result = await client.templates
      .group(externalId)
      .version(1)
      .instances.update([
        {
          externalId: expectedInstances[0].externalId,
          update: {
            fieldResolvers: {
              add: {
                a: 20,
              },
              remove: [],
            },
          },
        },
      ]);
    expect(result.map(toExternalTemplateInstance)).toEqual([
      {
        ...expectedInstances[0],
        fieldResolvers: { a: 20, b: 'test' },
      },
    ]);
  });

  it('should update template instances with remove', async () => {
    const result = await client.templates
      .group(externalId)
      .version(1)
      .instances.update([
        {
          externalId: expectedInstances[0].externalId,
          update: {
            fieldResolvers: {
              add: {},
              remove: ['a'],
            },
          },
        },
      ]);
    expect(result.map(toExternalTemplateInstance)).toEqual([
      {
        ...expectedInstances[0],
        fieldResolvers: { b: 'test' },
      },
    ]);
  });

  it('should update template instances with set', async () => {
    const result = await client.templates
      .group(externalId)
      .version(1)
      .instances.update([
        {
          externalId: expectedInstances[0].externalId,
          update: {
            fieldResolvers: {
              set: {
                a: 20,
              },
            },
          },
        },
      ]);
    expect(result.map(toExternalTemplateInstance)).toEqual([
      {
        ...expectedInstances[0],
        fieldResolvers: { a: 20 },
      },
    ]);
  });

  it.skip('should delete template instances', async () => {
    await client.templates
      .group(externalId)
      .version(1)
      .instances.delete([{ externalId: 'foo' }, { externalId: 'bar' }], {
        ignoreUnknownIds: true,
      });

    const result = await client.templates
      .group(externalId)
      .version(1)
      .instances.retrieve([{ externalId: 'foo' }, { externalId: 'bar' }], {
        ignoreUnknownIds: true,
      });
    expect(result.map(toExternalTemplateInstance)).toEqual([]);
  });

  function toExternalTemplateInstance(
    instance: TemplateInstance
  ): ExternalTemplateInstance {
    return {
      externalId: instance.externalId,
      templateName: instance.templateName,
      dataSetId: instance.dataSetId,
      fieldResolvers: instance.fieldResolvers,
    };
  }
});
