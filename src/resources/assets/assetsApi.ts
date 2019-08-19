// Copyright 2019 Cognite AS

import { chunk } from 'lodash';
import { makeAutoPaginationMethods } from '../../autoPagination';
import CogniteClient from '../../cogniteClient';
import { HttpClient } from '../../httpClient';
import { MetadataMap } from '../../metadata';
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
import { sortAssetCreateItems, undoArrayShuffle } from './assetUtils';

export class AssetsAPI extends BaseResourceAPI {
  /** @hidden */
  constructor(
    private client: CogniteClient,
    resourcePath: string,
    httpClient: HttpClient,
    private map: MetadataMap
  ) {
    super(httpClient, resourcePath);
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
    const [topologicalSortedItems, orginalIndices] = sortAssetCreateItems(
      items
    );
    const responses = await this.callCreateEndpoint<
      ExternalAssetItem,
      TypeAsset
    >(topologicalSortedItems);
    const mergedResponseItems = super.mergeResponsesOfItemsResponse(responses);
    const mergedResponseItemsInOriginalOrder = undoArrayShuffle(
      mergedResponseItems,
      orginalIndices
    );
    const assetList = this.transformToAssetList(
      mergedResponseItemsInOriginalOrder
    );
    return this.map.addAndReturn(assetList, responses[0]);
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
        items: this.transformToListOfAsset(response.data.items),
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
    const responses = await super.callRetrieveEndpoint<TypeAsset>(ids);
    const mergedResponseItems = super.mergeResponsesOfItemsResponse(responses);
    const assetList = this.transformToAssetList(mergedResponseItems);
    return this.map.addAndReturn(assetList, responses[0]);
  }

  /**
   * [Update assets](https://doc.cognitedata.com/api/v1/#operation/updateAssets)
   *
   * ```js
   * const assets = await client.assets.update([{id: 123, update: {name: {set: 'New name'}}}]);
   * ```
   */
  public async update(changes: AssetChange[]): Promise<AssetList> {
    const responses = await super.callUpdateEndpoint<AssetChange, TypeAsset>(
      changes
    );
    const mergedResponseItems = super.mergeResponsesOfItemsResponse(responses);
    const assetList = this.transformToAssetList(mergedResponseItems);
    return this.map.addAndReturn(assetList, responses[0]);
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
    const response = await super.callSearchEndpoint<
      AssetSearchFilter,
      TypeAsset
    >(query);
    const assetList = this.transformToAssetList(response.data.items);
    return this.map.addAndReturn(assetList, response);
  }

  /**
   * [Delete assets](https://doc.cognitedata.com/api/v1/#operation/deleteAssets)
   *
   * ```js
   * await client.assets.delete([{id: 123}, {externalId: 'abc'}]);
   * ```
   */
  public async delete(
    ids: AssetIdEither[],
    params?: AssetDeleteParams
  ): Promise<{}> {
    const responses = await super.callDeleteEndpoint(ids, params);
    return this.map.addAndReturn({}, responses[0]);
  }

  public async retrieveSubtree(id: IdEither, depth: number) {
    const currentDepth: number = 0;
    const rootAssetList = await this.retrieve([id]);
    return this.getAssetSubtree(rootAssetList, currentDepth, depth);
  }

  private transformToAssetList(assets: TypeAsset[]): AssetList {
    const assetArray = assets.map(asset => new Asset(this.client, asset));
    return new AssetList(this.client, assetArray);
  }

  private transformToListOfAsset(assets: TypeAsset[]): Asset[] {
    return assets.map(asset => new Asset(this.client, asset));
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
