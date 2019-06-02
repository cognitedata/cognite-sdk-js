// Copyright 2019 Cognite AS

import { AxiosInstance } from 'axios';
import { CogniteAsyncIterator } from '../../autoPagination';
import { MetadataMap } from '../../metadata';
import {
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
  private createEndpoint: AssetCreateEndpoint;
  private listEndpoint: AssetListEndpoint;
  private retrieveEndpoint: AssetRetrieveEndpoint;
  private updateEndpoint: AssetUpdateEndpoint;
  private searchEndpoint: AssetSearchEndpoint;
  private deleteEndpoint: AssetDeleteEndpoint;

  /** @hidden */
  constructor(project: string, instance: AxiosInstance, map: MetadataMap) {
    const path = projectUrl(project) + '/assets';
    this.createEndpoint = generateCreateEndpoint(
      instance,
      path,
      map,
      assetChunker
    );
    this.listEndpoint = generateListEndpoint(instance, path, map, true);
    this.retrieveEndpoint = generateRetrieveEndpoint(instance, path, map);
    this.updateEndpoint = generateUpdateEndpoint(instance, path, map);
    this.searchEndpoint = generateSearchEndpoint(instance, path, map);
    this.deleteEndpoint = generateDeleteEndpoint(instance, path, map);
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
  public create: AssetCreateEndpoint = items => {
    return this.createEndpoint(items);
  };

  /**
   * [List assets](https://doc.cognitedata.com/api/v1/#operation/listAssets)
   *
   * ```js
   * const assets = await client.assets.list({ filter: { name: '21PT1019' } });
   * ```
   */
  public list: AssetListEndpoint = scope => {
    return this.listEndpoint(scope);
  };

  /**
   * [Retrieve assets](https://doc.cognitedata.com/api/v1/#operation/byIdsAssets)
   *
   * ```js
   * const assets = await client.assets.retrieve([{id: 123}, {externalId: 'abc'}]);
   * ```
   */
  public retrieve: AssetRetrieveEndpoint = ids => {
    return this.retrieveEndpoint(ids);
  };

  /**
   * [Update assets](https://doc.cognitedata.com/api/v1/#operation/updateAssets)
   *
   * ```js
   * const assets = await client.assets.update([{id: 123, update: {name: {set: 'New name'}}}]);
   * ```
   */
  public update: AssetUpdateEndpoint = changes => {
    return this.updateEndpoint(changes);
  };

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
  public search: AssetSearchEndpoint = query => {
    return this.searchEndpoint(query);
  };

  /**
   * [Delete assets](https://doc.cognitedata.com/api/v1/#operation/deleteAssets)
   *
   * ```js
   * await client.assets.delete([{id: 123}, {externalId: 'abc'}]);
   * ```
   */
  public delete: AssetDeleteEndpoint = ids => {
    return this.deleteEndpoint(ids);
  };
}

export type AssetCreateEndpoint = (
  items: ExternalAssetItem[]
) => Promise<Asset[]>;

export type AssetListEndpoint = (
  scope?: AssetListScope
) => CogniteAsyncIterator<Asset>;

export type AssetRetrieveEndpoint = (ids: AssetIdEither[]) => Promise<Asset[]>;

export type AssetUpdateEndpoint = (changes: AssetChange[]) => Promise<Asset[]>;

export type AssetSearchEndpoint = (
  query: AssetSearchFilter
) => Promise<Asset[]>;

export type AssetDeleteEndpoint = (ids: AssetIdEither[]) => Promise<{}>;
