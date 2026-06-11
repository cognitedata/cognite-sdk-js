// Copyright 2020 Cognite AS

import { BaseResourceAPI } from '@cognite/sdk-core';
import type { ItemsWrapper } from '@cognite/sdk-core';
import type { DatapointInfo, IgnoreUnknownIds } from '../../types/common';
import type {
  Datapoints,
  DatapointsDeleteRequest,
  DatapointsInsertItem,
  DatapointsMonthlyGranularityMultiQuery,
  DatapointsMultiQuery,
  LatestDataBeforeRequest,
  NumericDatapointAggregates,
  StateDatapointAggregates,
  StateDatapointWrite,
  StateDatapointsInsertItem,
} from './types';

export class DataPointsAPI extends BaseResourceAPI<
  NumericDatapointAggregates | StateDatapointAggregates | Datapoints
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
   *
   * @remarks
   * State time series (beta) require the beta client (`cdf-version: beta` header):
   *
   * ```js
   * await client.datapoints.insert([{
   *   externalId: 'pump-state',
   *   datapoints: [{ timestamp: Date.now(), numericValue: 1, stringValue: 'RUNNING' }],
   * }]);
   * ```
   */
  public insert = (
    items: (DatapointsInsertItem | StateDatapointsInsertItem)[]
  ): Promise<object> => {
    return this.insertEndpoint(items.map(normalizeStateInsertItem));
  };

  /**
   * [Retrieve data points](https://doc.cognitedata.com/api/v1/#operation/getMultiTimeSeriesDatapoints)
   *
   * ```js
   * const data = await client.datapoints.retrieve({ items: [{ id: 123 }] });
   * ```
   *
   * @remarks
   * State time series (beta) require the beta client (`cdf-version: beta` header):
   *
   * ```js
   * const stateData = await client.datapoints.retrieve({
   *   items: [{ externalId: 'pump-state' }],
   *   aggregates: ['stateCount'],
   *   granularity: '1h',
   * });
   * ```
   */
  public retrieve = (
    query: DatapointsMultiQuery
  ): Promise<
    Datapoints[] | NumericDatapointAggregates[] | StateDatapointAggregates[]
  > => {
    return this.retrieveDatapointsEndpoint(query);
  };

  /**
   * @deprecated Use `retrieve()` with `granularity: '1mo'` instead. Will be removed in next major release.
   *
   * ```js
   * const monthlyAggregatesData = await client.datapoints.retrieve({ items: [{ id: 123 }], granularity: '1mo', aggregates: ['average'] });
   * ```
   */
  public retrieveDatapointMonthlyAggregates = async (
    query: DatapointsMonthlyGranularityMultiQuery
  ): Promise<NumericDatapointAggregates[] | StateDatapointAggregates[]> => {
    console.warn(
      'retrieveDatapointMonthlyAggregates is deprecated. Use retrieve() with granularity "1mo" instead. This method will be removed in the next major release.'
    );
    return this.retrieveDatapointsEndpoint<
      NumericDatapointAggregates[] | StateDatapointAggregates[]
    >({
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
    params: IgnoreUnknownIds = {}
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

  private async insertEndpoint(
    items: (DatapointsInsertItem | StateDatapointsInsertItem)[]
  ) {
    const path = this.url();
    await this.postInParallelWithAutomaticChunking({ path, items });
    return {};
  }

  protected async retrieveDatapointsEndpoint<
    T extends
      | NumericDatapointAggregates[]
      | StateDatapointAggregates[]
      | Datapoints[] =
      | NumericDatapointAggregates[]
      | StateDatapointAggregates[]
      | Datapoints[],
  >(query: DatapointsMultiQuery) {
    const path = this.listPostUrl;
    const response = await this.post<ItemsWrapper<T>>(path, {
      data: query,
    });
    for (const item of response.data.items) {
      mirrorStateValueAlias(item.datapoints);
    }
    return this.addToMapAndReturn(response.data.items, response);
  }

  private async retrieveLatestEndpoint(
    items: LatestDataBeforeRequest[],
    params: IgnoreUnknownIds
  ): Promise<Datapoints[]> {
    const path = this.url('latest');
    return this.callEndpointWithMergeAndTransform(
      items,
      (request) =>
        this.postInParallelWithAutomaticChunking({
          items: request,
          params,
          path,
          chunkSize: 100,
        }),
      undefined,
      (responseItems) => {
        for (const item of responseItems) {
          mirrorStateValueAlias(item.datapoints);
        }
        return responseItems;
      }
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

/**
 * Folds the deprecated `value` alias into `numericValue` for state items
 * (those with any data point carrying `numericValue` or `stringValue`).
 */
function normalizeStateInsertItem(
  item: DatapointsInsertItem | StateDatapointsInsertItem
): DatapointsInsertItem | StateDatapointsInsertItem {
  const isStateItem = item.datapoints.some(
    (datapoint) => 'numericValue' in datapoint || 'stringValue' in datapoint
  );
  if (!isStateItem) {
    return item;
  }
  return {
    ...item,
    datapoints: (item.datapoints as StateDatapointWrite[]).map(
      ({ value, ...datapoint }) =>
        value === undefined
          ? datapoint
          : { ...datapoint, numericValue: datapoint.numericValue ?? value }
    ),
  };
}

/**
 * Mirrors `numericValue` into the deprecated `value` alias on state data points.
 * @hidden
 */
export function mirrorStateValueAlias(
  datapoints: (
    | Datapoints
    | NumericDatapointAggregates
    | StateDatapointAggregates
  )['datapoints'][number][]
): void {
  for (const datapoint of datapoints) {
    if (
      'numericValue' in datapoint &&
      datapoint.numericValue !== undefined &&
      datapoint.value === undefined
    ) {
      datapoint.value = datapoint.numericValue;
    }
  }
}
