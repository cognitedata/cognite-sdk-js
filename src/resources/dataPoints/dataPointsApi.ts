// Copyright 2019 Cognite AS

import { MetadataMap } from '@/metadata';
import { BaseResourceAPI } from '@/resources/baseResourceApi';
import {
  DatapointsDeleteRequest,
  DatapointsGetAggregateDatapoint,
  DatapointsGetDatapoint,
  DatapointsMultiQuery,
  DatapointsPostDatapoint,
  ItemsResponse,
  LatestDataBeforeRequest,
} from '@/types/types';
import { CDFHttpClient } from '@/utils/http/cdfHttpClient';
import { promiseAllWithData } from '../assets/assetUtils';

export class DataPointsAPI extends BaseResourceAPI<any, any, any> {
  /** @hidden */
  constructor(
    resourcePath: string,
    httpClient: CDFHttpClient,
    map: MetadataMap
  ) {
    super(resourcePath, httpClient, map);
  }

  /**
   * [Insert data points](https://doc.cognitedata.com/api/v1/#operation/postMultiTimeSeriesDatapoints)
   *
   * ```js
   * await client.datapoints.insert([{ id: 123, datapoints: [{timestamp: 1557320284000, value: -2}] }]);
   * ```
   */
  public async insert(items: DatapointsPostDatapoint[]): Promise<{}> {
    return this.insertEndpoint(items);
  }

  /**
   * [Retrieve data points](https://doc.cognitedata.com/api/v1/#operation/getMultiTimeSeriesDatapoints)
   *
   * ```js
   * const data = await client.datapoints.retrieve({ items: [{ id: 123 }] });
   * ```
   */
  public async retrieve(
    query: DatapointsMultiQuery
  ): Promise<(DatapointsGetAggregateDatapoint | DatapointsGetDatapoint)[]> {
    return this.retrieveDatapointsEndpoint(query);
  }

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
  public async retrieveLatest(
    items: LatestDataBeforeRequest[]
  ): Promise<DatapointsGetDatapoint[]> {
    return this.retrieveLatestEndpoint(items);
  }

  /**
   * [Delete data points](https://doc.cognitedata.com/api/v1/#operation/deleteDatapoints)
   *
   * ```js
   * await client.datapoints.delete([{id: 123, inclusiveBegin: new Date('1 jan 2019')}]);
   * ```
   */
  public async delete(items: DatapointsDeleteRequest[]) {
    return this.deleteDatapointsEndpoint(items);
  }

  protected transformToList(items: any) {
    return items;
  }

  protected transformToClass(items: any) {
    return items;
  }

  private async insertEndpoint(items: DatapointsPostDatapoint[]) {
    const path = this.url('data');
    await this.postInParallelWithAutomaticChunking(path, items);
    return {};
  }

  private async retrieveDatapointsEndpoint(query: DatapointsMultiQuery) {
    const path = this.url('data/list');
    const response = await this.httpClient.post<
      ItemsResponse<
        (DatapointsGetAggregateDatapoint | DatapointsGetDatapoint)[]
      >
    >(path, {
      data: query,
    });
    return this.addToMapAndReturn(response.data.items, response);
  }

  private async retrieveLatestEndpoint(items: LatestDataBeforeRequest[]) {
    const path = this.url('data/latest');
    const response = await this.httpClient.post<
      ItemsResponse<DatapointsGetDatapoint[]>
    >(path, {
      data: { items },
    });
    return this.addToMapAndReturn(response.data.items, response);
  }

  private async deleteDatapointsEndpoint(items: LatestDataBeforeRequest[]) {
    const path = this.url('data/delete');
    await promiseAllWithData(
      BaseResourceAPI.chunk(items, 10000),
      singleChunk =>
        this.httpClient.post<ItemsResponse<ResponseType[]>>(path, {
          data: { singleChunk },
        }),
      false
    );
    return {};
  }
}
