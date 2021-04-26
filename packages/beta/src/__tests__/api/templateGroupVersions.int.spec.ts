// Copyright 2020 Cognite AS

import { ConflictMode } from '../../types';
import CogniteClient from '../../cogniteClient';
import { setupLoggedInClient } from '../testUtils';
import { randomInt } from '@cognite/sdk-core/src/testUtils';

describe('template group versions test', () => {
  let client: CogniteClient;

  const externalId = `VersionTest ${randomInt()}`;
  const expectedVersion = { schema: 'type Foo @template { field: Int }' };

  const templateGroups = [
    {
      externalId,
      description: 'Models a Well system',
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
    await cleanup();
    await client.templates.groups.upsert(templateGroups);
  });

  afterAll(async () => {
    await cleanup();
  });

  it.skip('should create template group version', async () => {
    const result = await client.templates
      .group(externalId)
      .versions.upsert(expectedVersion);
    expect(result).toEqual({
      ...expectedVersion,
      version: 1,
    });
  });

  it.skip(
    'should list template group versions with filter',
    async () => {
      const expectedVersions = [];
      for (let i = 0; i < 10; ++i) {
        expectedVersions.push({
          ...expectedVersion,
          version: i,
        });
        await client.templates.group(externalId).versions.upsert({
          ...expectedVersion,
          conflictMode: ConflictMode.Update,
        });
      }
      const result = await client.templates
        .group(externalId)
        .versions.list({
          filter: {
            minVersion: 2,
            maxVersion: 5,
          },
        })
        .autoPagingToArray({ limit: -1 });

      expect(result).toEqual(
        expectedVersions.slice(2, 6).sort((a, b) => b.version - a.version)
      );
    },
    10000
  );

  it.skip('should delete template group version', async () => {
    await client.templates.group(externalId).versions.delete(1);
    const result = await client.templates
      .group(externalId)
      .versions.list({
        filter: {
          maxVersion: 1,
        },
      })
      .autoPagingToArray({ limit: -1 });
    expect(result).toEqual([]);
  });
});
