// Copyright 2019 Cognite AS

import { chunk } from 'lodash';
import { CogniteError } from '../../error';
import { Node, topologicalSort } from '../../graphUtils';
import { CogniteMultiError } from '../../multiError';
import { DataExternalAssetItem } from '../../types';

/** @hidden */
export function assetChunker(
  assets: DataExternalAssetItem[],
  chunkSize: number = 1000
): DataExternalAssetItem[][] {
  const nodes: Node<DataExternalAssetItem>[] = assets.map(asset => {
    return { data: asset };
  });

  // find all new exteralIds and map the new externalId to the asset
  const externalIdMap = new Map<string, Node<DataExternalAssetItem>>();
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
