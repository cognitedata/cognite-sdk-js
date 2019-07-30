// Copyright 2019 Cognite AS

import { AxiosInstance } from 'axios';
import { chunk } from 'lodash';
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
import { AssetList } from '../classes/assetList';
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
    const transformResponse = this.transformToAssetListObject;
    this.create = generateCreateEndpoint(
      instance,
      path,
      map,
      transformResponse,
      assetChunker
    );
    this.list = generateListEndpoint(
      instance,
      path,
      map,
      true,
      transformResponse
    );
    this.retrieve = generateRetrieveEndpoint(
      instance,
      path,
      map,
      transformResponse
    );
    this.update = generateUpdateEndpoint(
      instance,
      path,
      map,
      transformResponse
    );
    this.search = generateSearchEndpoint(
      instance,
      path,
      map,
      transformResponse
    );
    this.delete = generateDeleteEndpoint(instance, path, map);
  }

  public async retrieveSubtree(id: types.CogniteInternalId, depth: number) {
    const currentDepth: number = 0;
    const rootAssetList = await this.retrieve([{ id }]);
    return this.getAssetSubtree(rootAssetList, currentDepth, depth);
  }

  private transformToAssetListObject = (assets: types.Asset[]) => {
    const assetArray = assets.map(asset => new Asset(this.client, asset));
    return new AssetList(this.client, assetArray);
  };

  private async getAssetSubtree(
    assets: AssetList,
    currentDepth: number,
    depth: number = Infinity
  ): Promise<AssetList> {
    const subtree: AssetList = assets;
    if (depth > currentDepth) {
      const children = await this.getChildren(assets);
      if (children.length !== 0) {
        const subtreeOfChildren = await this.getAssetSubtree(
          children,
          currentDepth + 1,
          depth
        );
        subtree.push(...subtreeOfChildren);
      }
    }
    return subtree;
  }

  private getChildren = async (assets: AssetList) => {
    const ids = assets.map(asset => asset.id);
    const chunks = chunk(ids, 100);
    const assetsArray: Asset[] = [];
    for (const chunkOfAssetIds of chunks) {
      const childrenList = await this.client.assets
        .list({
          filter: {
            parentIds: chunkOfAssetIds,
          },
        })
        .autoPagingToArray({ limit: Infinity });
      assetsArray.push(...childrenList);
    }
    return new AssetList(this.client, assetsArray);
  };
}

export type AssetCreateEndpoint = (
  items: types.ExternalAssetItem[]
) => Promise<AssetList>;

export type AssetListEndpoint = (
  scope?: types.AssetListScope
) => CogniteAsyncIterator<Asset>;

export type AssetRetrieveEndpoint = (
  ids: types.AssetIdEither[]
) => Promise<AssetList>;

export type AssetUpdateEndpoint = (
  changes: types.AssetChange[]
) => Promise<AssetList>;

export type AssetSearchEndpoint = (
  query: types.AssetSearchFilter
) => Promise<AssetList>;

export type AssetDeleteEndpoint = (ids: types.AssetIdEither[]) => Promise<{}>;
