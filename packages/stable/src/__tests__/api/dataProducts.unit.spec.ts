// Copyright 2026 Cognite AS

import matches from 'lodash/matches';
import nock from 'nock';
import { beforeEach, describe, expect, test } from 'vitest';
import { mockBaseUrl } from '../../../../core/src/__tests__/testUtils';
import type CogniteClient from '../../cogniteClient';
import { setupMockableClient } from '../testUtils';

describe('Data products unit test', () => {
  let client: CogniteClient;

  const dataProductFixture = {
    externalId: 'dp-1',
    name: 'Demo Data Product',
    schemaSpace: 'dp_1_space',
    description: 'Test data product',
    isGoverned: true,
    tags: ['demo'],
    domains: [],
  };

  const mockDataProduct = {
    ...dataProductFixture,
    createdTime: Date.now(),
    lastUpdatedTime: Date.now() + 1000,
  };

  beforeEach(() => {
    client = setupMockableClient();
    nock.cleanAll();
  });

  test('create', async () => {
    const createBody = {
      externalId: 'dp-1',
      name: 'Demo Data Product',
      description: 'create test',
      isGoverned: false,
      tags: ['a', 'b'],
    };

    nock(mockBaseUrl)
      .post(/\/dataproducts$/, matches({ items: [createBody] }))
      .once()
      .reply(201, {
        items: [{ ...mockDataProduct, ...createBody }],
      });

    const items = await client.dataProducts.create([createBody]);
    expect(items).toHaveLength(1);
    expect(items[0].externalId).toEqual(mockDataProduct.externalId);
  });

  test('list', async () => {
    nock(mockBaseUrl)
      .get(/\/dataproducts\/?$/)
      .query({ limit: '10', cursor: 'abc' })
      .once()
      .reply(200, {
        items: [mockDataProduct],
        nextCursor: 'next',
      });

    const response = await client.dataProducts.list({
      limit: 10,
      cursor: 'abc',
    });
    expect(response.items).toHaveLength(1);
    expect(response.items[0].externalId).toBe(mockDataProduct.externalId);
    expect(response.nextCursor).toBe('next');
  });

  test('retrieve by external ids', async () => {
    nock(mockBaseUrl)
      .post(/\/dataproducts\/byids$/, {
        items: [{ externalId: 'dp-1' }, { externalId: 'dp-2' }],
      })
      .once()
      .reply(200, {
        items: [mockDataProduct, { ...mockDataProduct, externalId: 'dp-2' }],
      });

    const items = await client.dataProducts.retrieve([
      { externalId: 'dp-1' },
      { externalId: 'dp-2' },
    ]);
    expect(items.map((item) => item.externalId)).toEqual(['dp-1', 'dp-2']);
    expect(items[0].createdTime).toEqual(mockDataProduct.createdTime);
  });

  test('retrieve splits more than 100 ids into multiple requests', async () => {
    const ids = Array.from({ length: 150 }, (_, i) => ({
      externalId: `dp-${i}`,
    }));
    const requestSizes: number[] = [];

    nock(mockBaseUrl)
      .post(/\/dataproducts\/byids$/)
      .times(2)
      .reply(200, (_uri, body: { items: { externalId: string }[] }) => {
        requestSizes.push(body.items.length);
        return {
          items: body.items.map(({ externalId }) => ({
            ...mockDataProduct,
            externalId,
          })),
        };
      });

    const items = await client.dataProducts.retrieve(ids);
    expect(requestSizes.sort((a, b) => b - a)).toEqual([100, 50]);
    expect(items).toHaveLength(150);
  });

  test('update', async () => {
    const updateBody = {
      externalId: 'dp-1',
      update: {
        name: { set: 'Renamed data product' },
        description: { set: 'updated description' },
      },
    };

    nock(mockBaseUrl)
      .post(/\/dataproducts\/update$/, matches({ items: [updateBody] }))
      .once()
      .reply(200, {
        items: [{ ...mockDataProduct, name: 'Renamed data product' }],
      });

    const items = await client.dataProducts.update([updateBody]);
    expect(items).toHaveLength(1);
    expect(items[0].name).toEqual('Renamed data product');
  });

  test('delete', async () => {
    nock(mockBaseUrl)
      .post(/\/dataproducts\/delete$/, { items: [{ externalId: 'dp-1' }] })
      .once()
      .reply(200, {});

    await client.dataProducts.delete([{ externalId: 'dp-1' }]);
  });
});
