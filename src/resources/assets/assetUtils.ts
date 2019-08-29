// Copyright 2019 Cognite AS

import { CogniteError } from '../../error';
import { Node, topologicalSort } from '../../graphUtils';
import { CogniteMultiError } from '../../multiError';
import { ExternalAssetItem } from '../../types/types';

/** @hidden */
export function enrichAssetsWithTheirParents(
  assets: ReadonlyArray<ExternalAssetItem>
): Node<ExternalAssetItem>[] {
  const externalIdMap = new Map<string, Node<ExternalAssetItem>>();
  const nodes: Node<ExternalAssetItem>[] = assets.map(asset => ({
    data: asset,
  }));

  // find all new exteralIds and map the new externalId to the asset
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

  return nodes;
}

/** @hidden */
export function sortAssetCreateItems(
  assets: ReadonlyArray<ExternalAssetItem>
): ExternalAssetItem[] {
  const nodes = enrichAssetsWithTheirParents(assets);
  const sortedNodes = topologicalSort(nodes);
  return sortedNodes.map(node => node.data);
}

/**
 * Resolves all Promises at once, even if some of them fail
 */
/** @hidden */
export async function promiseAllAtOnce<RequestType, ResponseType>(
  inputs: RequestType[],
  promiser: (input: RequestType) => Promise<ResponseType>
) {
  const failed: RequestType[] = [];
  const succeded: RequestType[] = [];
  const responses: ResponseType[] = [];
  const errors: (Error | CogniteError)[] = [];

  const promises = inputs.map(input => promiser(input));

  const wrappedPromises = promises.map((promise, index) =>
    promise
      .then(result => {
        succeded.push(inputs[index]);
        responses.push(result);
      })
      .catch(error => {
        failed.push(inputs[index]);
        errors.push(error);
      })
  );
  await Promise.all(wrappedPromises);
  if (failed.length) {
    throw {
      succeded,
      responses,
      failed,
      errors,
    };
  }

  return responses;
}

/** @hidden */
// TODO: refactor
export async function promiseAllWithData<RequestType, ResponseType>(
  inputs: RequestType[],
  promiser: (input: RequestType) => Promise<ResponseType>,
  runSequentially: boolean
) {
  try {
    if (runSequentially) {
      return await promiseEachInSequence(inputs, promiser);
    } else {
      return await promiseAllAtOnce(inputs, promiser);
    }
  } catch (err) {
    throw new CogniteMultiError(err);
  }
}

/**
 * Resolves Promises sequentially
 */
/** @hidden */
export async function promiseEachInSequence<RequestType, ResponseType>(
  inputs: RequestType[],
  promiser: (input: RequestType) => Promise<ResponseType>
) {
  return inputs.reduce(async (previousPromise, input, index) => {
    const prevResult = await previousPromise;
    try {
      return prevResult.concat(await promiser(input));
    } catch (err) {
      throw {
        errors: [err],
        failed: inputs.slice(index),
        succeded: inputs.slice(0, index),
        responses: prevResult,
      };
    }
  }, Promise.resolve(new Array<ResponseType>()));
}
