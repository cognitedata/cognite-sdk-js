// Copyright 2020 Cognite AS

import { BaseResourceAPI } from '@cognite/sdk-core';
import {
  DatapointsDeleteRequest,
  DatapointsGetAggregateDatapoint,
  DatapointsGetDatapoint,
  DatapointsMultiQuery,
  DatapointsPostDatapoint,
  IgnoreUnknownIds,
  ItemsWrapper,
  LatestDataBeforeRequest,
} from '../../types';

export class DataPointsAPI extends BaseResourceAPI<any> {
  /**
   * [Insert data points](https://doc.cognitedata.com/api/v1/#operation/postMultiTimeSeriesDatapoints)
   *
   * ```js
   * await client.datapoints.insert([{ id: 123, datapoints: [{timestamp: 1557320284000, value: -2}] }]);
   * ```
   */
  public insert = (items: DatapointsPostDatapoint[]): Promise<{}> => {
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
  ): Promise<DatapointsGetAggregateDatapoint[] | DatapointsGetDatapoint[]> => {
    return this.retrieveDatapointsEndpoint(query);
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
  ): Promise<DatapointsGetDatapoint[]> => {
    return this.retrieveLatestEndpoint(items, params);
  };

  /**
   * [Delete data points](https://doc.cognitedata.com/api/v1/#operation/deleteDatapoints)
   *
   * ```js
   * await client.datapoints.delete([{id: 123, inclusiveBegin: new Date('1 jan 2019')}]);
   * ```
   */
  public delete = (items: DatapointsDeleteRequest[]): Promise<{}> => {
    return this.deleteDatapointsEndpoint(items);
  };

  private async insertEndpoint(items: DatapointsPostDatapoint[]) {
    const path = this.url();
    await this.postInParallelWithAutomaticChunking({ path, items });
    return {};
  }

  private async retrieveDatapointsEndpoint(query: DatapointsMultiQuery) {
    const path = this.listPostUrl;
    const response = await this.httpClient.post<
      ItemsWrapper<(DatapointsGetAggregateDatapoint | DatapointsGetDatapoint)[]>
    >(path, {
      data: query,
    });
    return this.addToMapAndReturn(response.data.items, response);
  }

  private async retrieveLatestEndpoint(
    items: LatestDataBeforeRequest[],
    params: LatestDataParams
  ) {
    const path = this.url('latest');
    const response = await this.httpClient.post<
      ItemsWrapper<DatapointsGetDatapoint[]>
    >(path, {
      data: { items, ...params },
    });
    return this.addToMapAndReturn(response.data.items, response);
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
