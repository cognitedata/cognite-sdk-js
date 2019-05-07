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
  GetTimeSeriesMetadataDTO,
  TimeseriesFilter,
} from '../types/types';
import { projectUrl } from '../utils';

export interface TimeseriesAPI {
  /**
   * [List time series](https://doc.cognitedata.com/api/v1/#operation/getTimeSeries)
   *
   * ```js
   * const timeseries = await client.timeseries.list({ includeMetadata: false, assetIds: [1, 2] });
   * ```
   */
  list: (
    filter?: TimeseriesFilter
  ) => CogniteAsyncIterator<GetTimeSeriesMetadataDTO[]>;

  /**
   * [Create time series](https://doc.cognitedata.com/api/v1/#operation/postTimeSeries)
   *
   * ```js
   * const timeseries = [
   *   { name: 'Pressure sensor', assetId: 123 },
   *   { name: 'Temprature sensor', description: 'Pump abc', unit: 'C' },
   * ];
   * const createdTimeseries = await client.timeseries.create(timeseries);
   * ```
   */
  // create: (items: ExternalAssetItem[]) => Promise<Asset[]>;

  /**
   * [Retrieve assets](https://doc.cognitedata.com/api/v1/#operation/byIdsAssets)
   *
   * ```js
   * const assets = await client.assets.retrieve([{id: 123}, {externalId: 'abc'}]);
   * ```
   */
  // retrieve: (ids: AssetIdEither[]) => Promise<Asset[]>;

  /**
   * [Update assets](https://doc.cognitedata.com/api/v1/#operation/updateAssets)
   *
   * ```js
   * const assets = await client.assets.update([{id: 123, update: { name: 'New name' }}]);
   * ```
   */
  // update: (changes: AssetChange[]) => Promise<Asset[]>;

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
  // search: (query: AssetSearchFilter) => Promise<Asset[]>;

  /**
   * [Delete assets](https://doc.cognitedata.com/api/v1/#operation/deleteAssets)
   *
   * ```js
   * const assets = await client.assets.delete([{id: 123}, {externalId: 'abc'}]);
   */
  // delete: (ids: AssetIdEither[]) => Promise<{}>;
}

/** @hidden */
export function generateTimeseriesObject(
  project: string,
  instance: AxiosInstance,
  map: MetadataMap
): TimeseriesAPI {
  const path = projectUrl(project) + '/timeseries';
  return {
    list: generateListEndpoint(instance, path, map, false),
  };
}
