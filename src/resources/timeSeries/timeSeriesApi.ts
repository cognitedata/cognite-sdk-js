// Copyright 2019 Cognite AS

import CogniteClient from '../../cogniteClient';
import { MetadataMap } from '../../metadata';
import { BaseResourceAPI } from '../../resources/baseResourceApi';
import { CursorAndAsyncIterator } from '../../standardMethods';
import {
  GetTimeSeriesMetadataDTO,
  IdEither,
  IgnoreUnknownIds,
  ItemsWrapper,
  PostTimeSeriesMetadataDTO,
  SyntheticQuery,
  SyntheticQueryResponse,
  TimeseriesAggregate,
  TimeseriesAggregateQuery,
  TimeseriesFilter,
  TimeseriesFilterQuery,
  TimeSeriesSearchDTO,
  TimeSeriesUpdate,
} from '../../types/types';
import { CDFHttpClient } from '../../utils/http/cdfHttpClient';
import { TimeSeries } from '../classes/timeSeries';
import { TimeSeriesList } from '../classes/timeSeriesList';
import { promiseAllWithData } from '../assets/assetUtils';

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

  /**
   * [Synthetic Query](https://docs.cognite.com/api/v1/#operation/querySyntheticTimeseries)
   *
   * @param {SyntheticQuery[]} items - the queries made, will be chunked if over api limit
   * Note the limit on sum of datapoints per api request, which will not be chunked automatically
   * 
   * ```js
   * await client.timeseries.syntheticQuery([
   *   {
   *     expression: "24 * TS{externalId='production/hour', aggregate='average', granularity='1d'}",
   *     start: 0,
   *     end: 0,
   *     limit: 100
   *   }
   * ]);
   * ```
   */
  public syntheticQuery = (items: SyntheticQuery[]) => {
    return this.querySyntheticEndpoint(items);
  };

  protected transformToList(timeSeries: GetTimeSeriesMetadataDTO[]) {
    return timeSeries.map(timeSerie => new TimeSeries(this.client, timeSerie));
  }

  protected transformToClass(timeSeries: GetTimeSeriesMetadataDTO[]) {
    const timeseriesArray = this.transformToList(timeSeries);
    return new TimeSeriesList(this.client, timeseriesArray);
  }

  private syntheticQueryUrl() {
    return this.url('synthetic/query');
  }

  private async querySyntheticEndpoint(items: SyntheticQuery[]) {
    const path = this.syntheticQueryUrl();
    const chunkSize = 10; //The limit on amount of expressions per request

    const responses = await promiseAllWithData(BaseResourceAPI.chunk(items, chunkSize),
    singleChunk => this.httpClient.post<ItemsWrapper<SyntheticQueryResponse[]>>(path, {
      data: { items: singleChunk },
    }), false);

    // Should requests be cached somehow?

    return responses.reduce((acc, response) => acc.concat(response.data.items), [] as SyntheticQueryResponse[]);
  }
}

export type TimeseriesRetrieveParams = IgnoreUnknownIds;
