// Copyright 2020 Cognite AS

import { Node, topologicalSort } from '../graphUtils';

describe('Graph utils', () => {
  describe('topologicalSort', () => {
    test('straight tree', () => {
      const rootNode = { data: null };
      const childNode = { data: null, parentNode: rootNode };
      const grandChildNode = { data: null, parentNode: childNode };
      const inputOrder = [childNode, rootNode, grandChildNode];
      const outputOrder = [rootNode, childNode, grandChildNode];
      expect(topologicalSort(inputOrder)).toEqual(outputOrder);
    });

    test('single node', () => {
      const rootNode = { data: null };
      expect(topologicalSort([rootNode])).toEqual([rootNode]);
    });

    test('tree', () => {
      const nodeA = { data: null };
      const nodeAA = { data: null, parentNode: nodeA };
      const nodeAB = { data: null, parentNode: nodeA };
      const nodeAAA = { data: null, parentNode: nodeAA };
      const nodeAAB = { data: null, parentNode: nodeAA };
      const inputOrder = [nodeAB, nodeAAA, nodeA, nodeAAB, nodeAA];
      const outputOrder = topologicalSort(inputOrder);
      const visitedNodes = new Set();
      outputOrder.forEach((node) => {
        const { parentNode } = node;
        if (parentNode) {
          expect(visitedNodes.has(parentNode)).toBeTruthy();
        }
        visitedNodes.add(node);
      });
    });

    test('cycle', () => {
      const nodeA: Node<null> = { data: null };
      const nodeAA = { data: null, parentNode: nodeA };
      const nodeAAA = { data: null, parentNode: nodeAA };
      nodeA.parentNode = nodeAAA;
      expect(() =>
        topologicalSort([nodeA, nodeAA, nodeAAA])
      ).toThrowErrorMatchingInlineSnapshot(
        `"Impossible to topological sort nodes"`
      );
    });
  });
});
