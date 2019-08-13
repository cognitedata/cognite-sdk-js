// Copyright 2019 Cognite AS

import { AxiosInstance } from 'axios';
import { CogniteClient } from '../../index';
import { MetadataMap } from '../../metadata';
import {
  CursorAndAsyncIterator,
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
import { TimeSeries } from '../classes/timeSeries';
import { TimeSeriesList } from '../classes/timeSeriesList';

export class TimeSeriesAPI {
  /**
   * [List time series](https://doc.cognitedata.com/api/v1/#operation/getTimeSeries)
   *
   * ```js
   * const timeseries = await client.timeseries.list({ includeMetadata: false, assetIds: [1, 2] });
   * ```
   */
  public list: TimeSeriesListEndpoint;

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
  public create: TimeSeriesCreateEndpoint;

  /**
   * [Search for time series](https://doc.cognitedata.com/api/v1/#operation/searchTimeSeries)
   *
   * ```js
   * const timeseries = await client.timeseries.search({
   *   filter: {
   *     isString: false,
   *   },
   *   search: {
   *     name: 'Temperature'
   *   }
   * });
   * ```
   */
  public search: TimeSeriesSearchEndpoint;

  /**
   * [Retrieve time series](https://doc.cognitedata.com/api/v1/#operation/getTimeSeriesByIds)
   *
   * ```js
   * const timeseries = await client.timeseries.retrieve([
   *   { id: 123 },
   *   { externalId: 'abc' }
   * ]);
   * ```
   */
  public retrieve: TimeSeriesRetrieveEndpoint;

  /**
   * [Update time series](https://doc.cognitedata.com/api/v1/#operation/alterTimeSeries)
   *
   * ```js
   * const timeseries = await client.timeseries.update([{
   *   id: 3785438579439,
   *   update: {
   *     name: { set: 'New name' }
   *   }
   * }]);
   * ```
   */
  public update: TimeSeriesUpdateEndpoint;

  /**
   * [Delete time series](https://doc.cognitedata.com/api/v1/#operation/deleteTimeSeries)
   *
   * ```js
   * await client.timeseries.delete([
   *   { id: 123 },
   *   { externalId: 'abc' }
   * ]);
   * ```
   */
  public delete: TimeSeriesDeleteEndpoint;

  private client: CogniteClient;

  /** @hidden */
  constructor(
    client: CogniteClient,
    project: string,
    instance: AxiosInstance,
    map: MetadataMap
  ) {
    this.client = client;
    const path = projectUrl(project) + '/timeseries';
    const transformResponse = this.transformToTimeSeriesListObject;
    const defaultArgs: [
      AxiosInstance,
      string,
      MetadataMap,
      (timeseries: GetTimeSeriesMetadataDTO[]) => TimeSeriesList
    ] = [instance, path, map, transformResponse];
    this.create = generateCreateEndpoint(...defaultArgs);
    this.list = generateListEndpoint(
      instance,
      path,
      map,
      false,
      transformResponse
    );
    this.search = generateSearchEndpoint(...defaultArgs);
    this.retrieve = generateRetrieveEndpoint(...defaultArgs);
    this.update = generateUpdateEndpoint(...defaultArgs);
    this.delete = generateDeleteEndpoint(instance, path, map);
  }

  private transformToTimeSeriesListObject = (
    timeseries: GetTimeSeriesMetadataDTO[]
  ) => {
    const timeSeriesArray = timeseries.map(
      timeserie => new TimeSeries(this.client, timeserie)
    );
    return new TimeSeriesList(this.client, timeSeriesArray);
  };
}

export type TimeSeriesListEndpoint = (
  filter?: TimeseriesFilter
) => CursorAndAsyncIterator<TimeSeries>;

export type TimeSeriesCreateEndpoint = (
  items: PostTimeSeriesMetadataDTO[]
) => Promise<TimeSeriesList>;

export type TimeSeriesSearchEndpoint = (
  query: TimeSeriesSearchDTO
) => Promise<TimeSeriesList>;

export type TimeSeriesRetrieveEndpoint = (
  ids: TimeseriesIdEither[]
) => Promise<TimeSeriesList>;

export type TimeSeriesUpdateEndpoint = (
  changes: TimeSeriesUpdate[]
) => Promise<TimeSeriesList>;

export type TimeSeriesDeleteEndpoint = (
  ids: TimeseriesIdEither[]
) => Promise<{}>;
