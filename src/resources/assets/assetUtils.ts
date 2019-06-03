// Copyright 2019 Cognite AS

import { chunk } from 'lodash';
import { Node, topologicalSort } from '../../graphUtils';
import { ExternalAssetItem } from '../../types/custom';

/** @hidden */
export function assetChunker(
  assets: ExternalAssetItem[],
  chunkSize: number = 1000
): ExternalAssetItem[][] {
  const nodes: Node<ExternalAssetItem>[] = assets.map(asset => {
    return { data: asset };
  });

  // find all new exteralIds and map the new externalId to the asset
  const externalIdMap = new Map<string, Node<ExternalAssetItem>>();
  nodes.forEach(node => {
    const { externalId } = node.data;
    if (externalId) {
      externalIdMap.set(externalId, node);
    }
  });

  // set correct Node.parentNode
  nodes.forEach(node => {
    const { parentExternalId } = node.data;
    // has an internal parent
    if (parentExternalId && externalIdMap.has(parentExternalId)) {
      node.parentNode = externalIdMap.get(parentExternalId);
    }
  });

  const sortedNodes = topologicalSort(nodes);
  return chunk(sortedNodes.map(node => node.data), chunkSize);
}
