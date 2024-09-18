import {
  DataPointsAPI as DataPointsAPIStable,
  type ItemsWrapper,
} from '@cognite/sdk';

import type {
  DatapointAggregate,
  DatapointAggregates,
  Datapoints,
  DatapointsMonthlyGranularityMultiQuery,
  DatapointsMultiQuery,
} from '../../types';

export class DataPointsAPI extends DataPointsAPIStable {
  public retrieve = (
    query: DatapointsMultiQuery
  ): Promise<DatapointAggregates[] | Datapoints[]> => {
    return this.retrieveDatapointsEndpoint(query);
  };

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
      const months = this.getMonthsBetweenDates(startDate, endDate);

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
}
