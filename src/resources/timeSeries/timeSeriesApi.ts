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
  GetTimeSeriesMetadataDTO,
  PostTimeSeriesMetadataDTO,
  TimeseriesFilter,
  TimeseriesIdEither,
  TimeSeriesSearchDTO,
  TimeSeriesUpdate,
} from '../../types/types';
import { projectUrl } from '../../utils';

export class TimeSeriesAPI {
  private listEndpoint: TimeSeriesListEndpoint;
  private createEndpoint: TimeSeriesCreateEndpoint;
  private searchEndpoint: TimeSeriesSearchEndpoint;
  private retrieveEndpoint: TimeSeriesRetrieveEndpoint;
  private updateEndpoint: TimeSeriesUpdateEndpoint;
  private deleteEndpoint: TimeSeriesDeleteEndpoint;

  /** @hidden */
  constructor(project: string, instance: AxiosInstance, map: MetadataMap) {
    const path = projectUrl(project) + '/timeseries';
    this.createEndpoint = generateCreateEndpoint(instance, path, map);
    this.listEndpoint = generateListEndpoint(instance, path, map, false);
    this.searchEndpoint = generateSearchEndpoint(instance, path, map);
    this.retrieveEndpoint = generateRetrieveEndpoint(instance, path, map);
    this.updateEndpoint = generateUpdateEndpoint(instance, path, map);
    this.deleteEndpoint = generateDeleteEndpoint(instance, path, map);
  }

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
  public create: TimeSeriesCreateEndpoint = items => {
    return this.createEndpoint(items);
  };

  /**
   * [List time series](https://doc.cognitedata.com/api/v1/#operation/getTimeSeries)
   *
   * ```js
   * const timeseries = await client.timeseries.list({ includeMetadata: false, assetIds: [1, 2] });
   * ```
   */
  public list: TimeSeriesListEndpoint = scope => {
    return this.listEndpoint(scope);
  };

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
  public search: TimeSeriesSearchEndpoint = query => {
    return this.searchEndpoint(query);
  };

  /**
   * [Retrieve time series](https://doc.cognitedata.com/api/v1/#operation/getTimeSeriesByIds)
   *
   * ```js
   * const timeseries = await client.timeseries.retrieve([{id: 123}, {externalId: 'abc'}]);
   * ```
   */
  public retrieve: TimeSeriesRetrieveEndpoint = ids => {
    return this.retrieveEndpoint(ids);
  };

  /**
   * [Update time series](https://doc.cognitedata.com/api/v1/#operation/alterTimeSeries)
   *
   * ```js
   * const timeseries = await client.timeseries.update([{id: 123, update: { name: 'New name' }}]);
   * ```
   */
  public update: TimeSeriesUpdateEndpoint = changes => {
    return this.updateEndpoint(changes);
  };

  /**
   * [Delete time series](https://doc.cognitedata.com/api/v1/#operation/deleteTimeSeries)
   *
   * ```js
   * await client.timeseries.delete([{id: 123}, {externalId: 'abc'}]);
   * ```
   */
  public delete: TimeSeriesDeleteEndpoint = ids => {
    return this.deleteEndpoint(ids);
  };
}

export type TimeSeriesListEndpoint = (
  filter?: TimeseriesFilter
) => CogniteAsyncIterator<GetTimeSeriesMetadataDTO[]>;

export type TimeSeriesCreateEndpoint = (
  items: PostTimeSeriesMetadataDTO[]
) => Promise<GetTimeSeriesMetadataDTO[]>;

export type TimeSeriesSearchEndpoint = (
  query: TimeSeriesSearchDTO
) => Promise<GetTimeSeriesMetadataDTO[]>;

export type TimeSeriesRetrieveEndpoint = (
  ids: TimeseriesIdEither[]
) => Promise<GetTimeSeriesMetadataDTO[]>;

export type TimeSeriesUpdateEndpoint = (
  changes: TimeSeriesUpdate[]
) => Promise<GetTimeSeriesMetadataDTO[]>;

export type TimeSeriesDeleteEndpoint = (
  ids: TimeseriesIdEither[]
) => Promise<{}>;
