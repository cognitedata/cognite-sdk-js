// Copyright 2019 Cognite AS

import { AxiosInstance } from 'axios';
import { CogniteAsyncIterator } from '../../autoPagination';
import CogniteClient from '../../cogniteClient';
import { MetadataMap } from '../../metadata';
import {
  CursorAndAsyncIterator,
  generateCreateEndpoint,
  generateDeleteEndpointWithParams,
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
    project: string,
    instance: AxiosInstance,
    map: MetadataMap,
    client: CogniteClient
  ) {
    this.client = client;
    const path = projectUrl(project) + '/assets';
    const transformResponse = (assets: types.Asset[]) =>
      assets.map(asset => new Asset(this.client, asset));
    this.create = generateCreateEndpoint(instance, path, map, assetChunker);
    this.list = generateListEndpoint(instance, path, map, true);
    this.retrieve = generateRetrieveEndpoint(
      instance,
      path,
      map,
      transformResponse
    );
    this.update = generateUpdateEndpoint(instance, path, map);
    this.search = generateSearchEndpoint(instance, path, map);
    this.delete = generateDeleteEndpointWithParams(instance, path, map);
  }

  // public retrieveSubtree(
  //   id: number,
  //   externalId: string | undefined,
  //   depth: Number
  // ): [any] | PromiseLike<[any]> {
  //   const currentDepth: number = 0;
  //   const asset = this.retrieve([id]);
  //   const subtree = this.getAssetSubtree(
  //     AssetList([asset]),
  //     currentDepth,
  //     depth
  //   );
  // }
  // public getAssetSubtree(
  //   assets: AssetList,
  //   currentDepth: number,
  //   depth: Number
  // ): AssetList {
  //   let subtree: AssetList = assets;
  //   if (depth > currentDepth) {
  //     const children = this.getChildren(assets);
  //     if (children) {
  //       // Need to extend the ArrayList here
  //       subtree = subtree.push(
  //         ...this.getAssetSubtree(children, currentDepth + 1, depth)
  //       );
  //     }
  //   }
  //   return subtree;
  // }
  // public getChildren(assets: AssetList): AssetList {
  //   const children: AssetList = new AssetList([]);
  //   children.add(assets.children(assets.map(asset => ({ id: asset.id }))));
  //   return children;
  // }
}

export type AssetCreateEndpoint = (
  items: types.ExternalAssetItem[]
) => Promise<types.Asset[]>;

export type AssetListEndpoint = (
  scope?: types.AssetListScope
) => CogniteAsyncIterator<types.Asset>;

export type AssetRetrieveEndpoint = (
  ids: types.AssetIdEither[]
) => Promise<Asset[]>;

export type AssetUpdateEndpoint = (
  changes: types.AssetChange[]
) => Promise<types.Asset[]>;

export type AssetSearchEndpoint = (
  query: types.AssetSearchFilter
) => Promise<types.Asset[]>;

export interface AssetDeleteParams {
  recursive?: boolean;
}

export type AssetDeleteEndpoint = (
  ids: types.AssetIdEither[],
  params?: AssetDeleteParams
) => Promise<{}>;
