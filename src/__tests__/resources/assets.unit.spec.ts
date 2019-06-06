// Copyright 2019 Cognite AS

import { assetChunker } from '../../resources/assets/assetUtils';

describe('Asset unit test', () => {
  describe('assetChunker', () => {
    test.each([{ parentId: 123 }, { parentExternalId: 'abc' }, {}])(
      'single asset',
      asset => {
        expect(assetChunker([asset], 1000)).toEqual([[asset]]);
      }
    );

    test('straight tree', () => {
      const rootAsset = {
        externalId: '123',
        parentExternalId: 'abc',
        name: 'qwe',
      };
      const childAsset = {
        externalId: 'def',
        name: 'qwer', // TODO: check if the name is actually required
        parentExternalId: rootAsset.externalId,
      };
      const grandChildAsset = {
        parentExternalId: childAsset.externalId,
        name: 'zxc',
      };
      expect(assetChunker([childAsset, rootAsset, grandChildAsset], 2)).toEqual(
        [[rootAsset, childAsset], [grandChildAsset]]
      );
    });

    test('regular tree', () => {
      const assetA = { name: '', externalId: 'A' };
      const assetAA = {
        name: '',
        externalId: 'AA',
        parentExternalId: assetA.externalId,
      };
      const assetAB = {
        name: '',
        externalId: 'AB',
        parentExternalId: assetA.externalId,
      };
      const assetAAA = {
        name: '',
        externalId: 'AAA',
        parentExternalId: assetAA.externalId,
      };
      const assetAAB = {
        name: '',
        externalId: 'AAB',
        parentExternalId: assetAA.externalId,
      };
      const someAsset = {
        parentId: 123,
        name: '',
      };
      const inputOrder = [
        assetAB,
        assetAAA,
        someAsset,
        assetA,
        assetAAB,
        assetAA,
      ];
      const chunks = assetChunker(inputOrder, 2);

      const dependencies = new Map();
      dependencies.set(assetAA, assetA);
      dependencies.set(assetAB, assetA);
      dependencies.set(assetAAA, assetAA);
      dependencies.set(assetAAB, assetAA);

      const visitedAssets = new Set();

      chunks.forEach(chunk => {
        chunk.forEach(asset => {
          if (dependencies.has(asset)) {
            expect(visitedAssets.has(dependencies.get(asset))).toBeTruthy();
          }
          visitedAssets.add(asset);
        });
      });
    });
  });
});
