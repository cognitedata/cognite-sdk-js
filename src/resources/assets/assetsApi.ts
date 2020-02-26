// Copyright 2019 Cognite AS

import { chunk } from 'lodash';
import { CursorAndAsyncIterator } from '../../autoPagination';
import CogniteClient from '../../cogniteClient';
import { MetadataMap } from '../../metadata';
import { BaseResourceAPI } from '../../resources/baseResourceApi';
import { Asset } from '../../resources/classes/asset';
import { AssetList } from '../../resources/classes/assetList';
import { RevertableArraySorter } from '../../revertableArraySorter';
import {
  Asset as TypeAsset,
  AssetAggregate,
  AssetAggregateQuery,
  AssetChange,
  AssetIdEither,
  AssetListScope,
  AssetRetrieveParams,
  AssetSearchFilter,
  ExternalAssetItem,
  IdEither,
} from '../../types/types';
import { CDFHttpClient } from '../../utils/http/cdfHttpClient';
import { sortAssetCreateItems } from './assetUtils';

export class AssetsAPI extends BaseResourceAPI<TypeAsset, Asset, AssetList> {
  /** @hidden */
  constructor(
    private client: CogniteClient,
    resourcePath: string,
    httpClient: CDFHttpClient,
    map: MetadataMap
  ) {
    super(resourcePath, httpClient, map);
  }

  /**
   * [Creates new assets](https://doc.cognitedata.com/api/v1/#operation/createAssets)
   *
   * ```js
   * const assets = [
   *   { name: 'First asset' },
   *   { name: 'Second asset', description: 'Another asset', externalId: 'anotherAsset' },
   *   { name: 'Child asset', parentExternalId: 'anotherAsset'},
   * ];
   * const createdAssets = await client.assets.create(assets);
   * ```
   */
  public create = (items: ExternalAssetItem[]): Promise<AssetList> => {
    const { sort, unsort } = new RevertableArraySorter(sortAssetCreateItems);
    return super.createEndpoint(items, undefined, sort, unsort);
  };

  /**
   * [List assets](https://doc.cognitedata.com/api/v1/#operation/listAssets)
   * <!-- or [similar](https://doc.cognitedata.com/api/v1/#operation/getAssets) -->
   *
   * ```js
   * const assets = await client.assets.list({ filter: { name: '21PT1019' } });
   * ```
   */
  public list = (
    scope?: AssetListScope
  ): CursorAndAsyncIterator<Asset, AssetList> => {
    return super.listEndpoint(this.callListEndpointWithPost, scope);
  };

  /**
   * [Aggregate assets](https://docs.cognite.com/api/v1/#operation/aggregateAssets)
   *
   * ```js
   * const aggregates = await client.assets.aggregate({ filter: { root: true } });
   * console.log('Number of root assets: ', aggregates[0].count)
   * ```
   */
  public aggregate = (
    query: AssetAggregateQuery
  ): Promise<AssetAggregate[]> => {
    return super.aggregateEndpoint(query);
  };

  /**
   * [Retrieve assets](https://doc.cognitedata.com/api/v1/#operation/byIdsAssets)
   * <!-- or [similar](https://doc.cognitedata.com/api/v1/#operation/getAsset) -->
   *
   * ```js
   * const assets = await client.assets.retrieve([{id: 123}, {externalId: 'abc'}]);
   * ```
   */
  public retrieve = (
    ids: IdEither[],
    params: AssetRetrieveParams = {}
  ): Promise<AssetList> => {
    return super.retrieveEndpoint(ids, params);
  };

  /**
   * [Update assets](https://doc.cognitedata.com/api/v1/#operation/updateAssets)
   *
   * ```js
   * const assets = await client.assets.update([{id: 123, update: {name: {set: 'New name'}}}]);
   * ```
   */
  public update = (changes: AssetChange[]): Promise<AssetList> => {
    return super.updateEndpoint(changes);
  };

  /**
   * [Search for assets](https://doc.cognitedata.com/api/v1/#operation/searchAssets)
   *
   * ```js
   * const assets = await client.assets.search({
   *   filter: {
   *     parentIds: [1, 2]
   *   },
   *   search: {
   *     query: '21PT1019'
   *   }
   * });
   * ```
   */
  public search = (query: AssetSearchFilter): Promise<AssetList> => {
    return super.searchEndpoint(query);
  };

  /**
   * [Delete assets](https://doc.cognitedata.com/api/v1/#operation/deleteAssets)
   *
   * ```js
   * await client.assets.delete([{id: 123}, {externalId: 'abc'}]);
   * ```
   */
  public delete = (ids: AssetIdEither[], params: AssetDeleteParams = {}) => {
    const paramsWithIgnoreUnknownIds = {
      ...params,
      ignoreUnknownIds: true,
    };
    return super.deleteEndpoint(ids, paramsWithIgnoreUnknownIds);
  };

  public retrieveSubtree = async (id: IdEither, depth: number) => {
    const currentDepth: number = 0;
    const rootAssetList = await this.retrieve([id]);
    return this.getAssetSubtree(rootAssetList, currentDepth, depth);
  };

  protected transformToList(assets: TypeAsset[]) {
    return assets.map(asset => new Asset(this.client, asset));
  }

  protected transformToClass(assets: TypeAsset[]) {
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

export interface AssetDeleteParams {
  recursive?: boolean;
}
