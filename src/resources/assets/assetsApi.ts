// Copyright 2019 Cognite AS

import { AxiosInstance } from 'axios';
import { MetadataMap } from '../../metadata';
import {
  CursorAndAsyncIterator,
  generateCreateEndpoint,
  generateDeleteEndpoint,
  generateListEndpoint,
  generateRetrieveEndpoint,
  generateSearchEndpoint,
  generateUpdateEndpoint,
} from '../../standardMethods';
import {
  Asset,
  AssetChange,
  AssetIdEither,
  AssetListScope,
  AssetSearchFilter,
  ExternalAssetItem,
} from '../../types/types';
import { projectUrl } from '../../utils';
import { assetChunker } from './assetUtils';

export class AssetsAPI {
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
  public create: AssetCreateEndpoint;

  /**
   * [List assets](https://doc.cognitedata.com/api/v1/#operation/listAssets)
   * <!-- or [similar](https://doc.cognitedata.com/api/v1/#operation/getAssets) -->
   *
   * ```js
   * const assets = await client.assets.list({ filter: { name: '21PT1019' } });
   * ```
   */
  public list: AssetListEndpoint;

  /**
   * [Retrieve assets](https://doc.cognitedata.com/api/v1/#operation/byIdsAssets)
   * <!-- or [similar](https://doc.cognitedata.com/api/v1/#operation/getAsset) -->
   *
   * ```js
   * const assets = await client.assets.retrieve([{id: 123}, {externalId: 'abc'}]);
   * ```
   */
  public retrieve: AssetRetrieveEndpoint;

  /**
   * [Update assets](https://doc.cognitedata.com/api/v1/#operation/updateAssets)
   *
   * ```js
   * const assets = await client.assets.update([{id: 123, update: {name: {set: 'New name'}}}]);
   * ```
   */
  public update: AssetUpdateEndpoint;

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
  public search: AssetSearchEndpoint;

  /**
   * [Delete assets](https://doc.cognitedata.com/api/v1/#operation/deleteAssets)
   *
   * ```js
   * await client.assets.delete([{id: 123}, {externalId: 'abc'}]);
   * ```
   */
  public delete: AssetDeleteEndpoint;

  /** @hidden */
  constructor(project: string, instance: AxiosInstance, map: MetadataMap) {
    const path = projectUrl(project) + '/assets';
    this.create = generateCreateEndpoint(instance, path, map, assetChunker);
    this.list = generateListEndpoint(instance, path, map, true);
    this.retrieve = generateRetrieveEndpoint(instance, path, map);
    this.update = generateUpdateEndpoint(instance, path, map);
    this.search = generateSearchEndpoint(instance, path, map);
    this.delete = generateDeleteEndpoint(instance, path, map);
  }
}

export type AssetCreateEndpoint = (
  items: ExternalAssetItem[]
) => Promise<Asset[]>;

export type AssetListEndpoint = (
  scope?: AssetListScope
) => CursorAndAsyncIterator<Asset>;

export type AssetRetrieveEndpoint = (ids: AssetIdEither[]) => Promise<Asset[]>;

export type AssetUpdateEndpoint = (changes: AssetChange[]) => Promise<Asset[]>;

export type AssetSearchEndpoint = (
  query: AssetSearchFilter
) => Promise<Asset[]>;

export type AssetDeleteEndpoint = (ids: AssetIdEither[]) => Promise<{}>;
