// Copyright 2020 Cognite AS
import { uniqBy } from 'lodash';
import CogniteClient from '../../cogniteClient';
import { DatapointsMultiQueryBase } from '../../types';
import { TimeSeriesImpl } from './timeSeries';

export class TimeSeriesList extends Array<TimeSeriesImpl> {
  constructor(private client: CogniteClient, items: TimeSeriesImpl[]) {
    super(...items);
  }

  /**
   * Deletes all timeseries in the TimeSeriesList
   * ```js
   * await timeSeriesList.delete();
   * ```
   */
  public delete = async () => {
    return this.client.timeseries.delete(
      this.map(timeseries => ({ id: timeseries.id }))
    );
  };

  /**
   * Retrieves all the assets related to all the timeseries in the TimeSeriesList
   * ```js
   * const assets = await timeSeriesList.getAllAssets();
   * ```
   */
  public getAllAssets = async () => {
    const assetIds = this.filter(
      timeseries => timeseries.assetId !== undefined
    ).map(timeseries => ({
      id: timeseries.assetId as number,
    }));
    return this.client.assets.retrieve(uniqBy(assetIds, 'id'));
  };

  /**
   * Retrieves all the datapoints related to all the timeseries in the TimeSeriesList
   *
   * @param {DatapointsMultiQuery} options Query-options for datapoints
   * ```js
   * const datapoints = await timeSeriesList.getAllDatapoints();
   * ```
   */
  public getAllDatapoints = async (options: DatapointsMultiQueryBase = {}) => {
    const timeseriesIds = this.map(timeseries => ({ id: timeseries.id }));
    return this.client.datapoints.retrieve({
      items: timeseriesIds,
      ...options,
    });
  };
}
