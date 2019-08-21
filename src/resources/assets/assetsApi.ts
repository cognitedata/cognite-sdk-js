// Copyright 2019 Cognite AS

import { chunk } from 'lodash';
import { makeAutoPaginationMethods } from '../../autoPagination';
import CogniteClient from '../../cogniteClient';
import { HttpClient } from '../../httpClient';
import { MetadataMap } from '../../metadata';
import { RevertableArraySorter } from '../../revertableArraySorter';
import { CursorAndAsyncIterator } from '../../standardMethods';
import {
  Asset as TypeAsset,
  AssetChange,
  AssetDeleteParams,
  AssetIdEither,
  AssetListScope,
  AssetSearchFilter,
  ExternalAssetItem,
  IdEither,
} from '../../types/types';
import { BaseResourceAPI } from '../baseResourceApi';
import { Asset } from '../classes/asset';
import { AssetList } from '../classes/assetList';
import { sortAssetCreateItems } from './assetUtils';

export class AssetsAPI extends BaseResourceAPI<TypeAsset, Asset> {
  /** @hidden */
  constructor(
    private client: CogniteClient,
    resourcePath: string,
    httpClient: HttpClient,
    map: MetadataMap
  ) {
    super(httpClient, resourcePath, map);
  }

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
  public async create(items: ExternalAssetItem[]): Promise<AssetList> {
    const { sort, unsort } = new RevertableArraySorter(sortAssetCreateItems);
    return super.callCreateWithPrePostModifiersMergeAndTransform(items, sort, unsort);
  }

  /**
   * [List assets](https://doc.cognitedata.com/api/v1/#operation/listAssets)
   * <!-- or [similar](https://doc.cognitedata.com/api/v1/#operation/getAssets) -->
   *
   * ```js
   * const assets = await client.assets.list({ filter: { name: '21PT1019' } });
   * ```
   */
  public list(query?: AssetListScope): CursorAndAsyncIterator<Asset> {
    const listPromise = super
      .callListEndpointWithPost<AssetListScope, TypeAsset>(query)
      .then(response => ({
        ...response.data,
        items: this.transformToList(response.data.items),
      }))
      .then(transformedResponse =>
        super.addNextPageFunction<AssetListScope, Asset>(
          super.callListEndpointWithPost,
          transformedResponse,
          query
        )
      );
    const autoPaginationMethods = makeAutoPaginationMethods(listPromise);
    return Object.assign(listPromise, autoPaginationMethods);
  }

  /**
   * [Retrieve assets](https://doc.cognitedata.com/api/v1/#operation/byIdsAssets)
   * <!-- or [similar](https://doc.cognitedata.com/api/v1/#operation/getAsset) -->
   *
   * ```js
   * const assets = await client.assets.retrieve([{id: 123}, {externalId: 'abc'}]);
   * ```
   */
  public async retrieve(ids: IdEither[]): Promise<AssetList> {
    return super.callRetrieveWithMergeAndTransform(ids)
  }

  /**
   * [Update assets](https://doc.cognitedata.com/api/v1/#operation/updateAssets)
   *
   * ```js
   * const assets = await client.assets.update([{id: 123, update: {name: {set: 'New name'}}}]);
   * ```
   */
  public async update(changes: AssetChange[]): Promise<AssetList> {
    return super.callUpdateWithMergeAndTransform(changes)
  }

  /**
   * [Search for assets](https://doc.cognitedata.com/api/v1/#operation/searchAssets)
   *
   * ```js
   * const assets = await client.assets.search({
   *   filter: {
   *     parentIds: [1, 2]
   *   },
   *   search: {
   *     name: '21PT1019'
   *   }
   * });
   * ```
   */
  public async search(query: AssetSearchFilter): Promise<AssetList> {
    return super.callSearchWithTransform(query);
  }

  /**
   * [Delete assets](https://doc.cognitedata.com/api/v1/#operation/deleteAssets)
   *
   * ```js
   * await client.assets.delete([{id: 123}, {externalId: 'abc'}]);
   * ```
   */
  public async delete(ids: AssetIdEither[], params?: AssetDeleteParams) {
    return super.callDelete(ids, params);
  }

  public async retrieveSubtree(id: IdEither, depth: number) {
    const currentDepth: number = 0;
    const rootAssetList = await this.retrieve([id]);
    return this.getAssetSubtree(rootAssetList, currentDepth, depth);
  }

  protected transformToList(assets: TypeAsset[]) {
    return assets.map(asset => new Asset(this.client, asset));
  }

  protected transformToClass(assets: TypeAsset[]): AssetList {
    const assetArray = this.transformToList(assets);
    return new AssetList(this.client, assetArray);
  }

  private async getAssetSubtree(
    assets: AssetList,
    currentDepth: number,
    depth: number = Infinity
  ): Promise<AssetList> {
    const subtree = assets;
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
