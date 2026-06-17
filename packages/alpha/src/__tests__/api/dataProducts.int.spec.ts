// Copyright 2026 Cognite AS

import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import type CogniteClientAlpha from '../../cogniteClient';
import type { DataProduct } from '../../types';
import { randomInt, setupLoggedInClient } from '../testUtils';

const RESERVED_SCHEMA_SPACE = 'sdk_js_alpha_dataproducts_int_space';

describe('Data products integration test', () => {
  let client: CogniteClientAlpha;
  const dataProductRandom = randomInt();
  const dataProductExternalId = `int-dataproduct-${dataProductRandom}`;
  let createdDataProduct: DataProduct | undefined;

  beforeAll(async () => {
    client = setupLoggedInClient();

    await client.spaces.upsert([
      {
        space: RESERVED_SCHEMA_SPACE,
        name: RESERVED_SCHEMA_SPACE,
        description: 'Space for Data Products integration tests',
      },
    ]);

    const items = await client.dataProducts.create([
      {
        externalId: dataProductExternalId,
        name: `integration test data product ${dataProductRandom}`,
        schemaSpace: RESERVED_SCHEMA_SPACE,
        isGoverned: true,
        tags: ['integration'],
      },
    ]);
    createdDataProduct = items[0];
  });

  afterAll(async () => {
    if (!createdDataProduct) {
      return;
    }
    await client.dataProducts
      .delete([{ externalId: dataProductExternalId }])
      .catch();
  });

  test('create', async () => {
    const externalId = `int-dataproduct-create-${randomInt()}`;
    const items = await client.dataProducts.create([
      {
        externalId,
        name: 'data product create test',
        schemaSpace: RESERVED_SCHEMA_SPACE,
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
    const items = await client.dataProducts.create([
      {
        externalId,
        name: 'data product to delete',
        schemaSpace: RESERVED_SCHEMA_SPACE,
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
