// Copyright 2019 Cognite AS

import {
  assetChunker,
  promiseAllAtOnce,
  promiseEachInSequence,
} from '../../resources/assets/assetUtils';

describe('Asset unit test', () => {
  describe('multi promise resolution', () => {
    test('promiseAllAtOnce: fail', async () => {
      const data = ['x', 'a', 'b', 'c'];
      await expect(
        promiseAllAtOnce(
          data,
          input =>
            input === 'x'
              ? Promise.reject(input + 'x')
              : Promise.resolve(input + 'r')
        )
      ).rejects.toEqual({
        failed: ['x'],
        succeded: ['a', 'b', 'c'],
        errors: ['xx'],
        responses: ['ar', 'br', 'cr'],
      });
    });

    test('promiseAllAtOnce: one element', async () => {
      const fail = () =>
        new Promise(() => {
          throw new Error('y');
        });
      await expect(promiseAllAtOnce(['x'], fail)).rejects.toEqual({
        failed: ['x'],
        succeded: [],
        errors: [new Error('y')],
        responses: [],
      });
    });

    test('promiseAllAtOnce: success', async () => {
      const data = ['a', 'b', 'c'];
      await expect(
        promiseAllAtOnce(data, input => Promise.resolve(input))
      ).resolves.toEqual(['a', 'b', 'c']);
    });

    test('promiseEachInSequence', async () => {
      expect(
        await promiseEachInSequence([], input => Promise.resolve(input))
      ).toEqual([]);

      expect(
        await promiseEachInSequence([1], input => Promise.resolve(input))
      ).toEqual([1]);

      expect(
        await promiseEachInSequence([1, 2, 3], input => Promise.resolve(input))
      ).toEqual([1, 2, 3]);

      await expect(
        promiseEachInSequence([1, 2], () => Promise.reject('reject'))
      ).rejects.toEqual({
        failed: [1, 2],
        succeded: [],
        errors: ['reject'],
        responses: [],
      });

      await expect(
        promiseEachInSequence(
          [1, 0, 2, 3],
          input => (input ? Promise.resolve(input) : Promise.reject('x'))
        )
      ).rejects.toEqual({
        failed: [0, 2, 3],
        succeded: [1],
        errors: ['x'],
        responses: [1],
      });
    });
  });

  describe('assetChunker', () => {
    test.each([{ parentId: 123 }, { parentExternalId: 'abc' }, {}])(
      'single asset',
      asset => {
        expect(assetChunker([asset], 1000)).toEqual([[asset]]);
      }
    );

    test('straight tree', () => {
      const rootAsset = { externalId: '123', parentExternalId: 'abc' };
      const childAsset = {
        externalId: 'def',
        parentExternalId: rootAsset.externalId,
      };
      const grandChildAsset = { parentExternalId: childAsset.externalId };
      expect(assetChunker([childAsset, rootAsset, grandChildAsset], 2)).toEqual(
        [[rootAsset, childAsset], [grandChildAsset]]
      );
    });

    test('regular tree', () => {
      const assetA = { externalId: 'A' };
      const assetAA = { externalId: 'AA', parentExternalId: assetA.externalId };
      const assetAB = { externalId: 'AB', parentExternalId: assetA.externalId };
      const assetAAA = {
        externalId: 'AAA',
        parentExternalId: assetAA.externalId,
      };
      const assetAAB = {
        externalId: 'AAB',
        parentExternalId: assetAA.externalId,
      };
      const someAsset = {
        parentId: 123,
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
