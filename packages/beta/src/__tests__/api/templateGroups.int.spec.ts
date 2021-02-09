// Copyright 2020 Cognite AS

import { TemplateGroup } from 'beta/src/types';
import { randomInt } from '@cognite/sdk-core/src/testUtils';
import CogniteClient from '../../cogniteClient';
import { setupLoggedInClient } from '../testUtils';

describe('template group test', () => {
  let client: CogniteClient;
  let username: string;
  let expectedTemplateGroups: TemplateGroup[];

  const templateGroups = [
    {
      externalId: `Wells ${randomInt()}`,
      description: 'Models a Well system',
      owners: ['user.name@example.com'],
    },
    {
      externalId: `FooBar ${randomInt()}`,
      description: 'Models a FooBar system',
      owners: ['user.name@example.com'],
    },
  ];

  const cleanup = async () => {
    await client.templates.groups.delete(templateGroups, {
      ignoreUnknownIds: true,
    });
  };

  beforeAll(async () => {
    client = setupLoggedInClient();
    const status = await client.login.status();
    // eslint-disable-next-line prettier/prettier
    username = status?.user || 'unknown';
    expectedTemplateGroups = templateGroups.map(tg => ({
      ...tg,
      owners: [...tg.owners, username],
    }));
    await cleanup();
  });

  afterAll(async () => {
    await cleanup();
  });

  const sortByExternalId = (groups: TemplateGroup[]) => {
    groups.sort((a, b) => a.externalId.length - b.externalId.length);
  };

  it('should create template groups', async () => {
    const result = await client.templates.groups.create(templateGroups);
    expect(sortByExternalId(result)).toEqual(
      sortByExternalId(expectedTemplateGroups)
    );
  });

  it('should upsert template groups', async () => {
    const result = await client.templates.groups.upsert(templateGroups);
    expect(sortByExternalId(result)).toEqual(
      sortByExternalId(expectedTemplateGroups)
    );
  });

  it('should retrieve template groups', async () => {
    const result = await client.templates.groups.retrieve(templateGroups);
    expect(sortByExternalId(result)).toEqual(
      sortByExternalId(expectedTemplateGroups)
    );
  });

  it('should list template groups', async () => {
    const result = await client.templates.groups
      .list()
      .autoPagingToArray({ limit: -1 });
    expect(sortByExternalId(result)).toEqual(
      sortByExternalId(expectedTemplateGroups)
    );
  });

  it('should delete template groups', async () => {
    const result = await client.templates.groups.delete(
      [...templateGroups, { externalId: 'MISSING' }],
      { ignoreUnknownIds: true }
    );
    expect(result).toEqual({});
  });
});
