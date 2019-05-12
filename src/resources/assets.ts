// Copyright 2019 Cognite AS

import { AxiosInstance } from 'axios';
import { CogniteAsyncIterator } from '../autoPagination';
import { MetadataMap } from '../metadata';
import {
  generateCreateEndpoint,
  generateDeleteEndpoint,
  generateListEndpoint,
  generateRetrieveEndpoint,
  generateSearchEndpoint,
  generateUpdateEndpoint,
} from '../standardMethods';
import {
  Asset,
  AssetChange,
  AssetIdEither,
  AssetListScope,
  AssetSearchFilter,
  ExternalAssetItem,
} from '../types/types';
import { projectUrl } from '../utils';

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
  create: (items: ExternalAssetItem[]) => Promise<Asset[]>;

  /**
   * [List assets](https://doc.cognitedata.com/api/v1/#operation/listAssets)
   *
   * ```js
   * const assets = await client.assets.list({ filter: { name: '21PT1019' } });
   * ```
   */
  list: (scope?: AssetListScope) => CogniteAsyncIterator<Asset>;

  /**
   * [Retrieve assets](https://doc.cognitedata.com/api/v1/#operation/byIdsAssets)
   *
   * ```js
   * const assets = await client.assets.retrieve([{id: 123}, {externalId: 'abc'}]);
   * ```
   */
  retrieve: (ids: AssetIdEither[]) => Promise<Asset[]>;

  /**
   * [Update assets](https://doc.cognitedata.com/api/v1/#operation/updateAssets)
   *
   * ```js
   * const assets = await client.assets.update([{id: 123, update: {name: {set: 'New name'}}}]);
   * ```
   */
  update: (changes: AssetChange[]) => Promise<Asset[]>;

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
  search: (query: AssetSearchFilter) => Promise<Asset[]>;

  /**
   * [Delete assets](https://doc.cognitedata.com/api/v1/#operation/deleteAssets)
   *
   * ```js
   * await client.assets.delete([{id: 123}, {externalId: 'abc'}]);
   */
  delete: (ids: AssetIdEither[]) => Promise<{}>;
}

/** @hidden */
export function generateAssetsObject(
  project: string,
  instance: AxiosInstance,
  map: MetadataMap
): AssetsAPI {
  const path = projectUrl(project) + '/assets';
  return {
    create: generateCreateEndpoint(instance, path, map),
    list: generateListEndpoint(instance, path, map, true),
    retrieve: generateRetrieveEndpoint(instance, path, map),
    update: generateUpdateEndpoint(instance, path, map),
    search: generateSearchEndpoint(instance, path, map),
    delete: generateDeleteEndpoint(instance, path, map),
  };
}
