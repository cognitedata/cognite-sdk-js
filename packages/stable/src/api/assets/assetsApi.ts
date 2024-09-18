// Copyright 2020 Cognite AS

import {
  BaseResourceAPI,
  type CursorAndAsyncIterator,
} from '@cognite/sdk-core';
import { RevertableArraySorter } from '@cognite/sdk-core';
import type {
  Asset,
  AssetAggregate,
  AssetAggregateQuery,
  AssetChange,
  AssetIdEither,
  AssetListScope,
  AssetRetrieveParams,
  AssetSearchFilter,
  ExternalAssetItem,
  IdEither,
} from '../../types';
import { sortAssetCreateItems } from './assetUtils';

export class AssetsAPI extends BaseResourceAPI<Asset> {
  /**
   * @hidden
   */
  protected getDateProps() {
    return this.pickDateProps(['items'], ['createdTime', 'lastUpdatedTime']);
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
  public create = (items: ExternalAssetItem[]): Promise<Asset[]> => {
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
  public list = (scope?: AssetListScope): CursorAndAsyncIterator<Asset> => {
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
  ): Promise<Asset[]> => {
    return super.retrieveEndpoint(ids, params);
  };

  /**
   * [Update assets](https://doc.cognitedata.com/api/v1/#operation/updateAssets)
   *
   * ```js
   * const assets = await client.assets.update([{id: 123, update: {name: {set: 'New name'}}}]);
   * ```
   */
  public update = (changes: AssetChange[]): Promise<Asset[]> => {
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
  public search = (query: AssetSearchFilter): Promise<Asset[]> => {
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
}

export interface AssetDeleteParams {
  recursive?: boolean;
}
