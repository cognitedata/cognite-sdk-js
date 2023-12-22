// Copyright 2020 Cognite AS

import { BaseResourceAPI } from '@cognite/sdk-core';
import {
  DatapointsDeleteRequest,
  DatapointAggregates,
  DatapointAggregate,
  Datapoints,
  DatapointsMultiQuery,
  IgnoreUnknownIds,
  ItemsWrapper,
  LatestDataBeforeRequest,
  ExternalDatapointsQuery,
  DatapointInfo,
  Timestamp,
  DatapointsMonthlyGranularityMultiQuery,
} from '../../types';

export class DataPointsAPI extends BaseResourceAPI<
  DatapointAggregates | Datapoints
> {
  /**
   * @hidden
   */
  protected getDateProps() {
    return this.pickDateProps<DatapointInfo>(
      ['items', 'datapoints'],
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
  public insert = (items: ExternalDatapointsQuery[]): Promise<{}> => {
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
    // Find the start and end dates from the query
    const startDate = query.start;
    const endDate = query.end;

    if (startDate && endDate) {
      // Get the months between the start and end dates
      const months = getMonthsBetweenDates(startDate, endDate);

      // Create a array of promises for each month
      const promises = months.map((month) => {
        // Create a new query for each month
        const newQuery = {
          ...query,
          start: month.startDate,
          end: month.endDate,
          granularity: `${month.numberOfDays}d`,
        };

        // Return a promise for each month
        return this.retrieveDatapointsEndpoint(newQuery);
      });

      // Call the API for each month in parallel and save it in a variable
      const results = await Promise.all(promises);

      // Merge the datapoints into a single item per time series
      const mergedDatapoints: {
        [id: number]: DatapointAggregate[];
      } = {};
      const mergedTimeseries: {
        [id: number]: DatapointAggregates;
      } = {};

      for (const result of results) {
        // There can be multiple time series in a response, so we need to loop through each item
        for (const item of result) {
          if (!mergedTimeseries[item.id]) {
            mergedTimeseries[item.id] = item as DatapointAggregates;
          }
          if (item?.datapoints?.length) {
            if (!mergedDatapoints[item.id]) {
              mergedDatapoints[item.id] = item.datapoints;
            } else {
              mergedDatapoints[item.id].push(...item.datapoints);
            }
          }
        }
      }
      const resultSet: DatapointAggregates[] = [];

      for (const key in mergedTimeseries) {
        const item = mergedTimeseries[key];
        if (key in mergedDatapoints) {
          item.datapoints = mergedDatapoints[key];
        } else {
          item.datapoints = [];
        }
        resultSet.push(item as DatapointAggregates);
      }

      return resultSet;
    }

    return this.retrieveDatapointsEndpoint<DatapointAggregates[]>(query);
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
  public delete = (items: DatapointsDeleteRequest[]): Promise<{}> => {
    return this.deleteDatapointsEndpoint(items);
  };

  private async insertEndpoint(items: ExternalDatapointsQuery[]) {
    const path = this.url();
    await this.postInParallelWithAutomaticChunking({ path, items });
    return {};
  }

  private async retrieveDatapointsEndpoint<
    T extends DatapointAggregates[] | Datapoints[] =
      | DatapointAggregates[]
      | Datapoints[]
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
  ) {
    const path = this.url('latest');
    const response = await this.post<ItemsWrapper<Datapoints[]>>(path, {
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

interface MonthInfo {
  startDate: Timestamp;
  endDate: Timestamp;
  numberOfDays: number;
}

const getMonthsBetweenDates = (
  startDate: Timestamp | string,
  endDate: Timestamp | string
): MonthInfo[] => {
  const result: MonthInfo[] = [];

  const currentMonth = new Date(startDate);
  endDate = new Date(endDate);

  while (currentMonth <= endDate) {
    const firstDay = new Date(
      Date.UTC(currentMonth.getFullYear(), currentMonth.getMonth(), 1, 0)
    );
    const lastDay = new Date(
      Date.UTC(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1, 0)
    );

    result.push({
      startDate: firstDay.getTime(),
      endDate: lastDay.getTime(),
      numberOfDays:
        (lastDay.getTime() - firstDay.getTime()) / (24 * 3600 * 1000),
    });
    // Move to the next month
    currentMonth.setMonth(currentMonth.getMonth() + 1);
  }
  return result;
};

export type LatestDataParams = IgnoreUnknownIds;
