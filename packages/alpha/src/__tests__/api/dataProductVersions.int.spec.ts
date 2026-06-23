// Copyright 2026 Cognite AS

import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import type CogniteClientAlpha from '../../cogniteClient';
import type { DataProduct, DataProductVersion } from '../../types';
import { randomInt, setupLoggedInClient } from '../testUtils';

function uniqueSchemaSpace(prefix: string): string {
  return `${prefix}_${randomInt()}`;
}

describe('Data product versions integration test', () => {
  let client: CogniteClientAlpha;
  const dataProductRandom = randomInt();
  const dataProductExternalId = `int-dp-version-${dataProductRandom}`;
  const schemaSpace = uniqueSchemaSpace('sdk_js_alpha_dpv_int');
  const containerExternalId = `int_dpv_container_${dataProductRandom}`;
  const viewExternalId = `int_dpv_view_${dataProductRandom}`;
  const versionNumber = '1.0.0';
  let createdDataProduct: DataProduct | undefined;
  let createdVersion: DataProductVersion | undefined;

  beforeAll(async () => {
    client = setupLoggedInClient();

    await client.spaces.upsert([
      {
        space: schemaSpace,
        name: schemaSpace,
        description: 'Space for Data Product Versions integration tests',
      },
    ]);

    await client.containers.upsert([
      {
        externalId: containerExternalId,
        space: schemaSpace,
        name: containerExternalId,
        description: 'Container for Data Product Versions integration tests',
        properties: {
          test: {
            type: { type: 'text' },
          },
        },
      },
    ]);

    await client.views.upsert([
      {
        externalId: viewExternalId,
        space: schemaSpace,
        name: viewExternalId,
        description: 'View for Data Product Versions integration tests',
        version: '1',
        properties: {
          test: {
            container: {
              type: 'container',
              externalId: containerExternalId,
              space: schemaSpace,
            },
            containerPropertyIdentifier: 'test',
          },
        },
      },
    ]);

    const items = await client.dataProducts.create([
      {
        externalId: dataProductExternalId,
        name: `integration test data product ${dataProductRandom}`,
        schemaSpace,
        isGoverned: true,
        tags: ['integration'],
      },
    ]);
    createdDataProduct = items[0];

    const versionItems = await client.dataProductVersions.create(
      dataProductExternalId,
      [
        {
          version: versionNumber,
          views: [
            {
              space: schemaSpace,
              externalId: viewExternalId,
              version: '1',
            },
          ],
          description: 'integration test data product version',
          terms: { usage: 'integration test' },
        },
      ]
    );
    createdVersion = versionItems[0];
  });

  afterAll(async () => {
    if (createdVersion) {
      await client.dataProductVersions
        .delete(dataProductExternalId, [{ version: versionNumber }])
        .catch();
    }

    if (createdDataProduct) {
      await client.dataProducts
        .delete([{ externalId: dataProductExternalId }])
        .catch();
    }

    await client.views
      .delete([
        {
          space: schemaSpace,
          externalId: viewExternalId,
          version: '1',
        },
      ])
      .catch();

    await client.containers
      .delete([{ externalId: containerExternalId, space: schemaSpace }])
      .catch();

    await client.spaces.delete([schemaSpace]).catch();
  });

  test('create', async () => {
    const createVersion = '2.0.0';

    const items = await client.dataProductVersions.create(
      dataProductExternalId,
      [
        {
          version: createVersion,
          views: [
            {
              space: schemaSpace,
              externalId: viewExternalId,
              version: '1',
            },
          ],
          description: 'create test version',
        },
      ]
    );
    const created = items[0];

    expect(created.version).toBe(createVersion);
    expect(created.views).toHaveLength(1);

    await client.dataProductVersions
      .delete(dataProductExternalId, [{ version: createVersion }])
      .catch();
  });

  test('list', async () => {
    const response = await client.dataProductVersions.list(
      dataProductExternalId,
      { limit: 10 }
    );

    expect(response.items.length).toBeGreaterThan(0);
    expect(response.items.some((item) => item.version === versionNumber)).toBe(
      true
    );
  });

  test('retrieve by version', async () => {
    const version = await client.dataProductVersions.retrieve(
      dataProductExternalId,
      versionNumber
    );
    expect(version.version).toBe(versionNumber);
  });

  test('update existing data product version', async () => {
    const items = await client.dataProductVersions.update(
      dataProductExternalId,
      [
        {
          version: versionNumber,
          update: {
            description: { set: 'integration updated description' },
            status: { set: 'published' },
            terms: {
              modify: {
                usage: { set: 'updated usage terms' },
              },
            },
          },
        },
      ]
    );
    const updatedVersion = items[0];

    expect(updatedVersion.description).toBe('integration updated description');
    expect(updatedVersion.status).toBe('published');
    expect(updatedVersion.terms.usage).toBe('updated usage terms');
  });

  test('delete', async () => {
    const deleteVersion = '3.0.0';

    const items = await client.dataProductVersions.create(
      dataProductExternalId,
      [
        {
          version: deleteVersion,
          views: [
            {
              space: schemaSpace,
              externalId: viewExternalId,
              version: '1',
            },
          ],
        },
      ]
    );
    const versionToDelete = items[0];

    await expect(
      client.dataProductVersions.delete(dataProductExternalId, [
        { version: versionToDelete.version },
      ])
    ).resolves.toBeDefined();

    const listAfterDelete = await client.dataProductVersions.list(
      dataProductExternalId
    );
    expect(
      listAfterDelete.items.some((item) => item.version === deleteVersion)
    ).toBe(false);
  });
});
