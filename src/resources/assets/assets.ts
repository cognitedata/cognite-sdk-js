// Copyright 2019 Cognite AS

import { AxiosInstance } from 'axios';
import { chunk } from 'lodash';
import { CogniteAsyncIterator } from '../../autoPagination';
import { Node, topologicalSort } from '../../graphUtils';
import { MetadataMap } from '../../metadata';
import {
  generateCreateEndpoint,
  generateDeleteEndpoint,
  generateListEndpoint,
  generateRetrieveEndpoint,
  generateSearchEndpoint,
  generateUpdateEndpoint,
} from '../../standardMethods';
import * as types from '../../types/types';
import { projectUrl } from '../../utils';
import { Asset } from '../classes/asset';
import { AssetList } from '../classes/assetList';

export interface AssetsAPI {
  /**
   * [Creates new assets](https://doc.cognitedata.com/api/v1/#operation/createAssets)
   *
   * ```js
   * const assets = [
   *   { name: 'First asset' },
   *   { name: 'Second asset', description: 'Child asset' },
   * ];
   * const createdAssets = await client.assets.create(assets);
   * ```
   */
  create: (items: types.ExternalAssetItem[]) => Promise<AssetList>;

  /**
   * [List assets](https://doc.cognitedata.com/api/v1/#operation/listAssets)
   *
   * ```js
   * const assets = await client.assets.list({ filter: { name: '21PT1019' } });
   * ```
   */
  list: (scope?: types.AssetListScope) => CogniteAsyncIterator<types.Asset>;

  /**
   * [Retrieve assets](https://doc.cognitedata.com/api/v1/#operation/byIdsAssets)
   *
   * ```js
   * const assets = await client.assets.retrieve([{id: 123}, {externalId: 'abc'}]);
   * ```
   */
  retrieve: (ids: types.AssetIdEither[]) => Promise<types.Asset[]>;

  /**
   * [Update assets](https://doc.cognitedata.com/api/v1/#operation/updateAssets)
   *
   * ```js
   * const assets = await client.assets.update([{id: 123, update: {name: {set: 'New name'}}}]);
   * ```
   */
  update: (changes: types.AssetChange[]) => Promise<types.Asset[]>;

  /**
   * [Search for assets](https://doc.cognitedata.com/api/v1/#operation/searchAssets)
   *
   * ```js
   * const assets = await client.assets.search([{
   *   filter: {
   *     parentIds: [1, 2]
   *   },
   *   search: {
   *     name: '21PT1019'
   *   }
   * }]);
   * ```
   */
  search: (query: types.AssetSearchFilter) => Promise<types.Asset[]>;

  /**
   * [Delete assets](https://doc.cognitedata.com/api/v1/#operation/deleteAssets)
   *
   * ```js
   * await client.assets.delete([{id: 123}, {externalId: 'abc'}]);
   */
  delete: (ids: types.AssetIdEither[]) => Promise<{}>;
}

export function assetChunker(
  assets: types.ExternalAssetItem[],
  chunkSize: number = 1000
): types.ExternalAssetItem[][] {
  const nodes: Node<types.ExternalAssetItem>[] = assets.map(asset => {
    return { data: asset };
  });

  // find all new exteralIds and map the new externalId to the asset
  const externalIdMap = new Map<string, Node<types.ExternalAssetItem>>();
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

/** @hidden */
export function generateAssetsObject(
  project: string,
  instance: AxiosInstance,
  map: MetadataMap
): AssetsAPI {
  const path = projectUrl(project) + '/assets';
  return {
    create: async items => {
      const response = await generateCreateEndpoint(
        instance,
        path,
        map,
        assetChunker
      )(items);
      return new AssetList(this);
    },
    list: generateListEndpoint(instance, path, map, true),
    retrieve: generateRetrieveEndpoint(instance, path, map),
    update: generateUpdateEndpoint(instance, path, map),
    search: generateSearchEndpoint(instance, path, map),
    delete: generateDeleteEndpoint(instance, path, map),
  };
}