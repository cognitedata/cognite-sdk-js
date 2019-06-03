// Copyright 2019 Cognite AS

import { AxiosInstance } from 'axios';
import { MetadataMap } from '../../metadata';
import {
  generateDeleteEndpoint,
  generateInsertEndpoint,
  generateRetrieveLatestEndpoint,
  generateSimpleListEndpoint,
} from '../../standardMethods';
import {
  DatapointsDeleteRequest,
  DatapointsGetAggregateDatapoint,
  DatapointsGetDatapoint,
  DatapointsMultiQuery,
  DatapointsPostDatapoint,
  LatestDataBeforeRequest,
} from '../../types/types';
import { projectUrl } from '../../utils';

export class DataPointsAPI {
  /**
   * [Insert data points](https://doc.cognitedata.com/api/v1/#operation/postMultiTimeSeriesDatapoints)
   *
   * ```js
   * await client.datapoints.insert([{ id: 123, datapoints: [{timestamp: 1557320284000, value: -2}] }]);
   * ```
   */
  public insert: DataPointsInsertEndpoint;

  /**
   * [Retrieve data points](https://doc.cognitedata.com/api/v1/#operation/getMultiTimeSeriesDatapoints)
   *
   * ```js
   * const data = await client.datapoints.retrieve({ items: [{ id: 123 }] });
   * ```
   */
  public retrieve: DataPointsRetrieveEndpoint;

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
  public retrieveLatest: DataPointsRetrieveLatestEndpoint;

  /**
   * [Delete data points](https://doc.cognitedata.com/api/v1/#operation/deleteDatapoints)
   *
   * ```js
   * await client.datapoints.delete([{id: 123, inclusiveBegin: new Date('1 jan 2019')}]);
   * ```
   */
  public delete: DataPointsDeleteEndpoint;

  /** @hidden */
  constructor(project: string, instance: AxiosInstance, map: MetadataMap) {
    const path = projectUrl(project) + '/timeseries/data';
    this.insert = generateInsertEndpoint(instance, path, map);
    this.retrieve = generateSimpleListEndpoint(instance, path, map);
    this.retrieveLatest = generateRetrieveLatestEndpoint(instance, path, map);
    this.delete = generateDeleteEndpoint(instance, path, map);
  }
}

export type DataPointsInsertEndpoint = (
  items: DatapointsPostDatapoint[]
) => Promise<{}>;

export type DataPointsRetrieveEndpoint = (
  query: DatapointsMultiQuery
) => Promise<(DatapointsGetAggregateDatapoint | DatapointsGetDatapoint)[]>;

export type DataPointsRetrieveLatestEndpoint = (
  items: LatestDataBeforeRequest[]
) => Promise<DatapointsGetDatapoint[]>;

export type DataPointsDeleteEndpoint = (
  query: DatapointsDeleteRequest[]
) => Promise<{}>;
