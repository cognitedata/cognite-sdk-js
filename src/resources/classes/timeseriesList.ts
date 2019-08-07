// Copyright 2019 Cognite AS
import { uniqBy } from 'lodash';
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
    const assetIds: IdEither[] = this.map(timeseries => ({
      id: timeseries.assetId as number,
    })).filter(assetId => assetId.id !== undefined);
    return this.client.assets.retrieve(uniqBy(assetIds, 'id'));
  };

  public getAllDatapoints = async (options?: DatapointsMultiQuery) => {
    const timeseriesIds = this.map(timeseries => ({ id: timeseries.id }));
    return this.client.datapoints.retrieve({
      items: timeseriesIds,
      ...options,
    });
  };
}
