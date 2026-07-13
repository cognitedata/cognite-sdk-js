// Copyright 2026 Cognite AS

import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import type CogniteClientAlpha from '../../cogniteClient';
import type { DataProduct } from '../../types';
import { randomInt, setupLoggedInClient } from '../testUtils';

function uniqueSchemaSpace(prefix: string): string {
  return `${prefix}_${randomInt()}`;
}

describe('Data products integration test', () => {
  let client: CogniteClientAlpha;
  const dataProductRandom = randomInt();
  const dataProductExternalId = `int-dataproduct-${dataProductRandom}`;
  const setupSchemaSpace = uniqueSchemaSpace('sdk_js_alpha_dp_int_setup');
  const schemaSpacesToDelete: string[] = [setupSchemaSpace];
  let createdDataProduct: DataProduct | undefined;

  beforeAll(async () => {
    client = setupLoggedInClient();

    await client.spaces.upsert([
      {
        space: setupSchemaSpace,
        name: setupSchemaSpace,
        description: 'Space for Data Products integration tests',
      },
    ]);

    const items = await client.dataProducts.create([
      {
        externalId: dataProductExternalId,
        name: `integration test data product ${dataProductRandom}`,
        schemaSpace: setupSchemaSpace,
        isGoverned: true,
        tags: ['integration'],
      },
    ]);
    createdDataProduct = items[0];
  });

  afterAll(async () => {
    if (createdDataProduct) {
      await client.dataProducts
        .delete([{ externalId: dataProductExternalId }])
        .catch();
    }

    await client.spaces.delete(schemaSpacesToDelete).catch();
  });

  test('create', async () => {
    const externalId = `int-dataproduct-create-${randomInt()}`;
    const schemaSpace = uniqueSchemaSpace('sdk_js_alpha_dp_int_create');
    schemaSpacesToDelete.push(schemaSpace);
    await client.spaces.upsert([
      {
        space: schemaSpace,
        name: schemaSpace,
        description: 'Space for Data Products create integration test',
      },
    ]);

    const items = await client.dataProducts.create([
      {
        externalId,
        name: 'data product create test',
        schemaSpace,
        isGoverned: true,
        tags: ['create'],
      },
    ]);
    const created = items[0];

    expect(created.externalId).toBe(externalId);
    expect(created.name).toBe('data product create test');
    expect(created.isGoverned).toBe(true);

    await client.dataProducts.delete([{ externalId }]).catch();
  });

  test('list', async () => {
    const response = await client.dataProducts.list({ limit: 10 });
    expect(response.items.length).toBeGreaterThan(0);
    expect(
      response.items.some((item) => item.externalId === dataProductExternalId)
    ).toBe(true);
  });

  test('retrieve by external id', async () => {
    const dataProduct = await client.dataProducts.retrieve(
      dataProductExternalId
    );
    expect(dataProduct.externalId).toBe(dataProductExternalId);
  });

  test('update existing data product', async () => {
    const items = await client.dataProducts.update([
      {
        externalId: dataProductExternalId,
        update: {
          description: { set: 'integration updated description' },
          isGoverned: { set: false },
          tags: { set: ['integration', 'updated'] },
        },
      },
    ]);
    const updatedDataProduct = items[0];

    expect(updatedDataProduct.description).toBe(
      'integration updated description'
    );
    expect(updatedDataProduct.isGoverned).toBe(false);
  });

  test('delete', async () => {
    const externalId = `int-dataproduct-delete-${randomInt()}`;
    const schemaSpace = uniqueSchemaSpace('sdk_js_alpha_dp_int_delete');
    schemaSpacesToDelete.push(schemaSpace);
    await client.spaces.upsert([
      {
        space: schemaSpace,
        name: schemaSpace,
        description: 'Space for Data Products delete integration test',
      },
    ]);

    const items = await client.dataProducts.create([
      {
        externalId,
        name: 'data product to delete',
        schemaSpace,
      },
    ]);
    const dataProductToDelete = items[0];

    expect(dataProductToDelete.externalId).toBe(externalId);

    await expect(
      client.dataProducts.delete([
        { externalId: dataProductToDelete.externalId },
      ])
    ).resolves.toBeDefined();
  });
});
