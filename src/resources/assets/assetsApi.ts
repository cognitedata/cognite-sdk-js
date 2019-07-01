// Copyright 2019 Cognite AS

import { AxiosInstance } from 'axios';
import { CogniteAsyncIterator } from '../../autoPagination';
import CogniteClient from '../../cogniteClient';
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
import { assetChunker } from './assetUtils';
import { AssetList } from '../classes/assetList';

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

  private client: CogniteClient;

  /** @hidden */
  constructor(
    client: CogniteClient,
    project: string,
    instance: AxiosInstance,
    map: MetadataMap
  ) {
    this.client = client;
    const path = projectUrl(project) + '/assets';
    const transformResponse = this.transformToAssetObjects();
    this.create = generateCreateEndpoint(instance, path, map, transformResponse, assetChunker);
    this.list = generateListEndpoint(instance, path, map, true, transformResponse);
    this.retrieve = generateRetrieveEndpoint(
      instance,
      path,
      map,
      transformResponse
    );
    this.update = generateUpdateEndpoint(instance, path, map, transformResponse);
    this.search = generateSearchEndpoint(instance, path, map);
    this.delete = generateDeleteEndpoint(instance, path, map);
  }

  private transformToAssetObjects = () => {
    return (assets: types.Asset[]) => assets.map(asset => new Asset(this.client, asset));
  }

  public async retrieveSubtree(
    id: number,
    depth: number
  ) {
    const currentDepth: number = 0;
    const asset = await this.retrieve([{id}]);
    const assetList = new AssetList(this.client, asset);
    return this.getAssetSubtree(
      assetList,
      currentDepth,
      depth
    );
  }
  // List that includes the assets requesting the subtree
  private getAssetSubtree(
    assets: AssetList,
    currentDepth: number,
    depth: number
  ): AssetList {
    let subtree: AssetList = assets;
    if (depth > currentDepth) {
      const children = this.getChildren(assets);
      if (children) {
        subtree.push(...this.getAssetSubtree(children, currentDepth + 1, depth));
      }
    }
    return subtree;
  }

  private getChildren = (assets: AssetList) => {
    let children: Asset[] = [];
    assets.forEach(async asset => {
      const childrenList = await asset.children();
      children = children.concat(childrenList);
    });
    return new AssetList(this.client, children);
  }
}

export type AssetCreateEndpoint = (
  items: types.ExternalAssetItem[]
) => Promise<types.Asset[]>;

export type AssetListEndpoint = (
  scope?: types.AssetListScope
) => CogniteAsyncIterator<Asset>;

export type AssetRetrieveEndpoint = (
  ids: types.AssetIdEither[]
) => Promise<Asset[]>;

export type AssetUpdateEndpoint = (
  changes: types.AssetChange[]
) => Promise<types.Asset[]>;

export type AssetSearchEndpoint = (
  query: types.AssetSearchFilter
) => Promise<types.Asset[]>;

export type AssetDeleteEndpoint = (ids: types.AssetIdEither[]) => Promise<{}>;
