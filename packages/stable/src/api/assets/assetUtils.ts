// Copyright 2020 Cognite AS

import { GraphUtils } from '@cognite/sdk-core';
import type { ExternalAssetItem } from '../../types';

type Node<T> = GraphUtils.Node<T>;

/** @hidden */
export function enrichAssetsWithTheirParents(
  assets: ReadonlyArray<ExternalAssetItem>
): Node<ExternalAssetItem>[] {
  const externalIdMap = new Map<string, Node<ExternalAssetItem>>();
  const nodes: Node<ExternalAssetItem>[] = assets.map((asset) => ({
    data: asset,
  }));

  // find all new exteralIds and map the new externalId to the asset
  for (const node of nodes) {
    const { externalId } = node.data;
    if (externalId) {
      externalIdMap.set(externalId, node);
    }
  }

  // set correct Node.parentNode
  for (const node of nodes) {
    const { parentExternalId } = node.data;
    // has an internal parent
    if (parentExternalId && externalIdMap.has(parentExternalId)) {
      node.parentNode = externalIdMap.get(parentExternalId);
    }
  }

  return nodes;
}

/** @hidden */
export function sortAssetCreateItems(
  assets: ReadonlyArray<ExternalAssetItem>
): ExternalAssetItem[] {
  const nodes = enrichAssetsWithTheirParents(assets);
  const sortedNodes = GraphUtils.topologicalSort(nodes);
  return sortedNodes.map((node) => node.data);
}
