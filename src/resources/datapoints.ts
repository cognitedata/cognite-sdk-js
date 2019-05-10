// Copyright 2019 Cognite AS

import { AxiosInstance } from 'axios';
import { MetadataMap } from '../metadata';
import {
  generateDeleteEndpoint,
  generateInsertEndpoint,
  generateRetrieveLatestEndpoint,
  generateSimpleListEndpoint,
} from '../standardMethods';
import {
  DatapointsDeleteRequest,
  DatapointsGetAggregateDatapoint,
  DatapointsGetDatapoint,
  DatapointsMultiQuery,
  DatapointsPostDatapoint,
  LatestDataBeforeRequest,
} from '../types/types';
import { projectUrl } from '../utils';

export interface DatapointsAPI {
  /**
   * [Insert data points](https://doc.cognitedata.com/api/v1/#operation/postMultiTimeSeriesDatapoints)
   *
   * ```js
   * await client.datapoints.insert([{ id: 123, datapoints: [{timestamp: 1557320284000, value: -2}] }]);
   * ```
   */
  insert: (items: DatapointsPostDatapoint[]) => Promise<{}>;

  /**
   * [Retrieve data points](https://doc.cognitedata.com/api/v1/#operation/getMultiTimeSeriesDatapoints)
   *
   * ```js
   * const data = await client.datapoints.retrieve({ items: [{ id: 123 }] });
   * ```
   */
  retrieve: (
    query: DatapointsMultiQuery
  ) => Promise<(DatapointsGetAggregateDatapoint | DatapointsGetDatapoint)[]>;

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
  retrieveLatest: (
    items: LatestDataBeforeRequest[]
  ) => Promise<DatapointsGetDatapoint[]>;

  /**
   * [Delete data points](https://doc.cognitedata.com/api/v1/#operation/deleteDatapoints)
   *
   * ```js
   * await client.datapoints.delete([{id: 123, inclusiveBegin: new Date('1 jan 2019')}]);
   */
  delete: (query: DatapointsDeleteRequest[]) => Promise<{}>;
}

/** @hidden */
export function generateDatapointsObject(
  project: string,
  instance: AxiosInstance,
  map: MetadataMap
): DatapointsAPI {
  const path = projectUrl(project) + '/timeseries/data';
  return {
    insert: generateInsertEndpoint(instance, path, map),
    retrieve: generateSimpleListEndpoint(instance, path, map),
    retrieveLatest: generateRetrieveLatestEndpoint(instance, path, map),
    delete: generateDeleteEndpoint(instance, path, map),
  };
}
