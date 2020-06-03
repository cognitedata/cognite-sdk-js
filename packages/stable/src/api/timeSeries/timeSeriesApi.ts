// Copyright 2020 Cognite AS

import {
  BaseResourceAPI,
  CDFHttpClient,
  CursorAndAsyncIterator,
  MetadataMap,
} from '@cognite/sdk-core';
import CogniteClient from '../../cogniteClient';
import {
  GetTimeSeriesMetadataDTO,
  IdEither,
  IgnoreUnknownIds,
  PostTimeSeriesMetadataDTO,
  TimeseriesAggregate,
  TimeseriesAggregateQuery,
  TimeseriesFilter,
  TimeseriesFilterQuery,
  TimeSeriesSearchDTO,
  TimeSeriesUpdate,
} from '../../types';
import { TimeSeries } from '../classes/timeSeries';
import { TimeSeriesList } from '../classes/timeSeriesList';

export class TimeSeriesAPI extends BaseResourceAPI<
  GetTimeSeriesMetadataDTO,
  TimeSeries,
  TimeSeriesList
> {
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
  public create = (
    items: PostTimeSeriesMetadataDTO[]
  ): Promise<TimeSeriesList> => {
    return super.createEndpoint(items);
  };

  /**
   * [List time series](https://doc.cognitedata.com/api/v1/#operation/getTimeSeries)
   *
   * ```js
   * const timeseries = await client.timeseries.list({ includeMetadata: false, assetIds: [1, 2] });
   * ```
   */
  public list = (
    scope?: TimeseriesFilter
  ): CursorAndAsyncIterator<TimeSeries> => {
    let query: TimeseriesFilterQuery = {};
    if (scope) {
      const { includeMetadata, limit, cursor, partition, ...filter } = scope;
      query = { filter, limit, partition, cursor };
    }
    return super.listEndpoint(this.callListEndpointWithPost, query);
  };

  /**
   * [Aggregate timeseries](https://docs.cognite.com/api/v1/#operation/aggregateTimeSeries)
   *
   * ```js
   * const aggregates = await client.timeseries.aggregate({ filter: { isString: true } });
   * console.log('Number of string timeseries: ', aggregates[0].count)
   * ```
   */
  public aggregate = (
    query: TimeseriesAggregateQuery
  ): Promise<TimeseriesAggregate[]> => {
    return super.aggregateEndpoint(query);
  };

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
  public retrieve = (
    ids: IdEither[],
    params: TimeseriesRetrieveParams = {}
  ) => {
    return super.retrieveEndpoint(ids, params);
  };

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
  public update = (changes: TimeSeriesUpdate[]) => {
    return super.updateEndpoint(changes);
  };

  /**
   * [Search for time series](https://doc.cognitedata.com/api/v1/#operation/searchTimeSeries)
   *
   * ```js
   * const timeseries = await client.timeseries.search({
   *   filter: {
   *     isString: false,
   *   },
   *   search: {
   *     query: 'Temperature'
   *   }
   * });
   * ```
   */
  public search = (query: TimeSeriesSearchDTO) => {
    return super.searchEndpoint(query);
  };

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
  public delete = (ids: IdEither[]) => {
    return super.deleteEndpoint(ids);
  };

  protected transformToList(timeSeries: GetTimeSeriesMetadataDTO[]) {
    return timeSeries.map(timeSerie => new TimeSeries(this.client, timeSerie));
  }

  protected transformToClass(timeSeries: GetTimeSeriesMetadataDTO[]) {
    const timeseriesArray = this.transformToList(timeSeries);
    return new TimeSeriesList(this.client, timeseriesArray);
  }
}

export type TimeseriesRetrieveParams = IgnoreUnknownIds;
