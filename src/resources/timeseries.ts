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
  GetTimeSeriesMetadataDTO,
  PostTimeSeriesMetadataDTO,
  TimeseriesFilter,
  TimeseriesIdEither,
  TimeSeriesSearchDTO,
  TimeSeriesUpdate,
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
  create: (
    items: PostTimeSeriesMetadataDTO[]
  ) => Promise<GetTimeSeriesMetadataDTO[]>;

  /**
   * [Search for time series](https://doc.cognitedata.com/api/v1/#operation/searchTimeSeries)
   *
   * ```js
   * const timeseries = await client.timeseries.search([{
   *   filter: {
   *     isString: false,
   *   },
   *   search: {
   *     name: 'Temprature'
   *   }
   * }]);
   * ```
   */
  search: (query: TimeSeriesSearchDTO) => Promise<GetTimeSeriesMetadataDTO[]>;

  /**
   * [Retrieve time series](https://doc.cognitedata.com/api/v1/#operation/getTimeSeriesByIds)
   *
   * ```js
   * const timeseries = await client.timeseries.retrieve([{id: 123}, {externalId: 'abc'}]);
   * ```
   */
  retrieve: (ids: TimeseriesIdEither[]) => Promise<GetTimeSeriesMetadataDTO[]>;

  /**
   * [Update time series](https://doc.cognitedata.com/api/v1/#operation/alterTimeSeries)
   *
   * ```js
   * const timeseries = await client.timeseries.update([{id: 123, update: { name: 'New name' }}]);
   * ```
   */
  update: (changes: TimeSeriesUpdate[]) => Promise<GetTimeSeriesMetadataDTO[]>;

  /**
   * [Delete time series](https://doc.cognitedata.com/api/v1/#operation/deleteTimeSeries)
   *
   * ```js
   * await client.timeseries.delete([{id: 123}, {externalId: 'abc'}]);
   */
  delete: (ids: TimeseriesIdEither[]) => Promise<{}>;
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
    create: generateCreateEndpoint(instance, path, map),
    search: generateSearchEndpoint(instance, path, map),
    retrieve: generateRetrieveEndpoint(instance, path, map),
    update: generateUpdateEndpoint(instance, path, map),
    delete: generateDeleteEndpoint(instance, path, map),
  };
}
