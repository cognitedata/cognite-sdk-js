// Copyright 2020 Cognite AS

import {
  BaseResourceAPI,
  type CDFHttpClient,
  type CursorAndAsyncIterator,
  type MetadataMap,
} from '@cognite/sdk-core';
import type {
  ExternalTimeseries,
  IdEither,
  IgnoreUnknownIds,
  SyntheticQuery,
  TimeSeriesUpdate,
  Timeseries,
  TimeseriesAggregate,
  TimeseriesAggregateQuery,
  TimeseriesFilterQuery,
  TimeseriesSearchFilter,
} from '../../types';
import { SyntheticTimeSeriesAPI } from './syntheticTimeSeriesApi';

export class TimeSeriesAPI extends BaseResourceAPI<Timeseries> {
  private syntheticTimeseriesApi: SyntheticTimeSeriesAPI;

  /** @hidden */
  constructor(resourcePath: string, ...args: [CDFHttpClient, MetadataMap]) {
    super(resourcePath, ...args);
    this.syntheticTimeseriesApi = new SyntheticTimeSeriesAPI(
      this.url('synthetic'),
      ...args,
    );
  }

  /**
   * @hidden
   */
  protected getDateProps() {
    return this.pickDateProps(['items'], ['createdTime', 'lastUpdatedTime']);
  }

  /**
   * [Create time series](https://doc.cognitedata.com/api/v1/#operation/postTimeSeries)
   *
   * ```js
   * const timeseries = [
   *   { name: 'Pressure sensor', assetId: 123 },
   *   { name: 'Temperature sensor', description: 'Pump abc', unit: 'C' },
   * ];
   * const createdTimeseries = await client.timeseries.create(timeseries);
   * ```
   */
  public create = (items: ExternalTimeseries[]): Promise<Timeseries[]> => {
    return super.createEndpoint(items);
  };

  /**
   * [List time series](https://doc.cognitedata.com/api/v1/#operation/getTimeSeries)
   *
   * ```js
   * const timeseries = await client.timeseries.list({ filter: { assetIds: [1, 2] }});
   * ```
   */
  public list = (
    scope?: TimeseriesFilterQuery,
  ): CursorAndAsyncIterator<Timeseries> => {
    return super.listEndpoint(this.callListEndpointWithPost, scope);
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
    query: TimeseriesAggregateQuery,
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
    params: TimeseriesRetrieveParams = {},
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
  public search = (query: TimeseriesSearchFilter) => {
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

  /**
   * [Synthetic Query](https://docs.cognite.com/api/v1/#operation/querySyntheticTimeseries)
   *
   * ```js
   * await client.timeseries.syntheticQuery([
   *   {
   *     expression: "24 * TS{externalId='production/hour', aggregate='average', granularity='1d'}",
   *     start: '48h-ago',
   *     end: 'now',
   *     limit: 100
   *   }
   * ]);
   * ```
   */
  public syntheticQuery = (items: SyntheticQuery[]) => {
    return this.syntheticTimeseriesApi.query(items);
  };
}

export type TimeseriesRetrieveParams = IgnoreUnknownIds;
