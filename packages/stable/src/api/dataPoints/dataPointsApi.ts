// Copyright 2020 Cognite AS

import { BaseResourceAPI } from '@cognite/sdk-core';
import type { ItemsWrapper } from '@cognite/sdk-core';
import type { DatapointInfo, IgnoreUnknownIds } from '../../types/common';
import type {
  DatapointAggregates,
  Datapoints,
  DatapointsDeleteRequest,
  DatapointsMonthlyGranularityMultiQuery,
  DatapointsMultiQuery,
  ExternalDatapointsQuery,
  LatestDataBeforeRequest,
} from './types';

export class DataPointsAPI extends BaseResourceAPI<
  DatapointAggregates | Datapoints
> {
  /**
   * @hidden
   */
  protected getDateProps() {
    return this.pickDateProps<DatapointInfo>(
      ['items', 'datapoints', 'maxDatapoint', 'minDatapoint'],
      ['timestamp']
    );
  }

  /**
   * [Insert data points](https://doc.cognitedata.com/api/v1/#operation/postMultiTimeSeriesDatapoints)
   *
   * ```js
   * await client.datapoints.insert([{ id: 123, datapoints: [{timestamp: 1557320284000, value: -2}] }]);
   * ```
   */
  public insert = (items: ExternalDatapointsQuery[]): Promise<object> => {
    return this.insertEndpoint(items);
  };

  /**
   * [Retrieve data points](https://doc.cognitedata.com/api/v1/#operation/getMultiTimeSeriesDatapoints)
   *
   * ```js
   * const data = await client.datapoints.retrieve({ items: [{ id: 123 }] });
   * ```
   */
  public retrieve = (
    query: DatapointsMultiQuery
  ): Promise<DatapointAggregates[] | Datapoints[]> => {
    return this.retrieveDatapointsEndpoint(query);
  };

  /**
   *
   * ```js
   * const monthlyAggregatesData = await client.datapoints.retrieveDatapointMonthlyAggregates({ items: [{ id: 123 }] });
   * ```
   */
  public retrieveDatapointMonthlyAggregates = async (
    query: DatapointsMonthlyGranularityMultiQuery
  ): Promise<DatapointAggregates[]> => {
    return this.retrieveDatapointsEndpoint<DatapointAggregates[]>({
      ...query,
      granularity: '1mo',
    });
  };

  /**
   * [Get latest data point in a time series](https://doc.cognitedata.com/api/v1/#operation/getLatest)
   *
   * ```js
   * const datapoints = await client.datapoints.retrieveLatest([
   *   {
   *    before: 'now',
   *    id: 123
   *  },
   *  {
   *    externalId: 'abc',
   *    before: new Date('21 jan 2018'),
   *  }
   * ]);
   * ```
   */
  public retrieveLatest = (
    items: LatestDataBeforeRequest[],
    params: LatestDataParams = {}
  ): Promise<Datapoints[]> => {
    return this.retrieveLatestEndpoint(items, params);
  };

  /**
   * [Delete data points](https://doc.cognitedata.com/api/v1/#operation/deleteDatapoints)
   *
   * ```js
   * await client.datapoints.delete([{id: 123, inclusiveBegin: new Date('1 jan 2019')}]);
   * ```
   */
  public delete = (items: DatapointsDeleteRequest[]): Promise<object> => {
    return this.deleteDatapointsEndpoint(items);
  };

  private async insertEndpoint(items: ExternalDatapointsQuery[]) {
    const path = this.url();
    await this.postInParallelWithAutomaticChunking({ path, items });
    return {};
  }

  protected async retrieveDatapointsEndpoint<
    T extends DatapointAggregates[] | Datapoints[] =
      | DatapointAggregates[]
      | Datapoints[],
  >(query: DatapointsMultiQuery) {
    const path = this.listPostUrl;
    const response = await this.post<ItemsWrapper<T>>(path, {
      data: query,
    });
    return this.addToMapAndReturn(response.data.items, response);
  }

  private async retrieveLatestEndpoint(
    items: LatestDataBeforeRequest[],
    params: LatestDataParams
  ): Promise<Datapoints[]> {
    const path = this.url('latest');
    return this.callEndpointWithMergeAndTransform(items, (request) =>
      this.postInParallelWithAutomaticChunking({
        items: request,
        params,
        path,
        chunkSize: 100,
      })
    ) as Promise<Datapoints[]>;
  }

  private async deleteDatapointsEndpoint(items: DatapointsDeleteRequest[]) {
    await this.postInParallelWithAutomaticChunking({
      chunkSize: 10000,
      items,
      path: this.deleteUrl,
    });
    return {};
  }
}

export type LatestDataParams = IgnoreUnknownIds;
