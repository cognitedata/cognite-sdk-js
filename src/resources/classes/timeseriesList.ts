// Copyright 2019 Cognite AS

import { CogniteClient } from '../..';
import { DatapointsMultiQuery, IdEither } from '../../types/types';
import { TimeSeries } from './timeseries';

export class TimeSeriesList extends Array<TimeSeries> {
  private client: CogniteClient;
  constructor(client: CogniteClient, items: TimeSeries[]) {
    super(...items);
    this.client = client;
  }

  public delete = async () => {
    return this.client.timeseries.delete(
      this.map(timeseries => ({ id: timeseries.id }))
    );
  };

  public getAllAssets = async () => {
    const assetIds: IdEither[] = [];
    this.forEach(timeseries => {
      if (timeseries.assetId !== undefined) {
        assetIds.push({ id: timeseries.assetId });
      }
    });
    return this.client.assets.retrieve(assetIds);
  };

  public getAllDatapoints = async (options?: DatapointsMultiQuery) => {
    const timeseriesIds = this.map(timeseries => ({ id: timeseries.id }));
    return this.client.datapoints.retrieve({
      items: timeseriesIds,
      ...options,
    });
  };
}
