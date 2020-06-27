// Copyright 2020 Cognite AS

import { GraphUtils } from '@cognite/sdk-core';
import * as nock from 'nock';
import { enrichAssetsWithTheirParents } from '../../api/assets/assetUtils';
import CogniteClient from '../../cogniteClient';
import { ExternalAssetItem } from '../../types';
import { setupMockableClient } from '../testUtils';
import { mockBaseUrl } from '../testUtils';

// tslint:disable-next-line:no-big-function
describe('Assets unit test', () => {
  let client: CogniteClient;
  beforeEach(() => {
    client = setupMockableClient();
    nock.cleanAll();
  });

  test('delete with ignoreUnknownIds', async () => {
    const assetIds = [{ id: 123 }];
    nock(mockBaseUrl)
      .post(new RegExp('/assets/delete'), {
        ignoreUnknownIds: true,
        items: [{ id: 123 }],
      })
      .once()
      .reply(200, {});
    await client.assets.delete(assetIds);
  });

  describe('enrichAssestsWithTheirParents(...)', () => {
    test.each([{ parentId: 123 }, { parentExternalId: 'abc' }, {}])(
      'single asset',
      asset => {
        expect(enrichAssetsWithTheirParents([asset])).toEqual([
          { data: asset },
        ]);
      }
    );

    test('straight tree', () => {
      const rootAsset = {
        externalId: '123',
        parentExternalId: 'abc',
        name: 'root',
      };
      const childAsset = {
        externalId: 'def',
        parentExternalId: rootAsset.externalId,
        name: 'child',
      };
      const grandChildAsset = {
        parentExternalId: childAsset.externalId,
        name: 'grandchild',
      };
      const assets = [childAsset, rootAsset, grandChildAsset];
      const nodes: GraphUtils.Node<ExternalAssetItem>[] = assets.map(asset => ({
        data: asset,
        parentNode: undefined,
      }));
      nodes[0].parentNode = nodes[1];
      nodes[2].parentNode = nodes[0];
      expect(enrichAssetsWithTheirParents(assets)).toEqual(nodes);
    });

    test('regular tree', () => {
      const assetA = { externalId: 'A', name: 'A' };
      const assetAA = {
        externalId: 'AA',
        parentExternalId: assetA.externalId,
        name: 'AA',
      };
      const assetAB = {
        externalId: 'AB',
        parentExternalId: assetA.externalId,
        name: 'AB',
      };
      const assetAAA = {
        externalId: 'AAA',
        parentExternalId: assetAA.externalId,
        name: 'AAA',
      };
      const assetAAB = {
        externalId: 'AAB',
        parentExternalId: assetAA.externalId,
        name: 'AAB',
      };
      const someAsset = {
        parentId: 123,
        name: 'someAsset',
      };
      const assets = [assetAB, assetAAA, someAsset, assetA, assetAAB, assetAA];
      const nodes = enrichAssetsWithTheirParents(assets);

      const dependencies = new Map();
      dependencies.set(assetAA, assetA);
      dependencies.set(assetAB, assetA);
      dependencies.set(assetAAA, assetAA);
      dependencies.set(assetAAB, assetAA);

      const visitedAssets = new Set();

      nodes.forEach(node => {
        const dependency = dependencies.get(node);
        if (dependency) {
          expect(visitedAssets.has(dependency)).toBeTruthy();
        }
        visitedAssets.add(node);
      });
    });
  });

  describe('class is not polluted with enumerable props', async () => {
    const items = [
      {
        id: 1,
      },
      {
        id: 2,
      },
    ];

    beforeEach(() => {
      nock.cleanAll();
      nock(mockBaseUrl)
        .post(new RegExp('/assets/list'))
        .thrice()
        .reply(200, { items });
    });

    test('JSON.stringify works', async () => {
      const assets = await client.assets.list().autoPagingToArray();
      expect(() => JSON.stringify(assets)).not.toThrow();
      expect(() => JSON.stringify(assets[0])).not.toThrow();
    });

    test('change context for asset utility methods', async () => {
      const assets = await client.assets.list().autoPagingToArray();
      const utilMethod = assets[0].children;
      const result = await utilMethod();
      const resultAfterBind = await utilMethod.call(null);
      expect({ ...result[0] }).toEqual({ ...resultAfterBind[0] });
      expect([{ ...result[0] }, { ...result[1] }]).toEqual(items);
    });

    test('spread operator receives only object data props', async () => {
      const assets = await client.assets.list().autoPagingToArray();
      expect([{ ...assets[0] }, { ...assets[1] }]).toEqual(items);
      expect(Object.assign({}, assets[1])).toEqual(items[1]);
    });
  });
});
