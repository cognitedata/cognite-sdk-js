// Copyright 2019 Cognite AS
import { CogniteClient } from '../..';
import {
  DatapointsMultiQuery,
  GetTimeSeriesMetadataDTO,
  LatestDataPropertyFilter,
} from '../../types/types';
import { BaseResource } from './baseResource';

export class TimeSeries extends BaseResource<GetTimeSeriesMetadataDTO>
  implements GetTimeSeriesMetadataDTO {
  public get externalId() {
    return this.props.externalId;
  }
  public get name() {
    return this.props.name;
  }
  public get isString() {
    return this.props.isString;
  }
  public get metadata() {
    return this.props.metadata;
  }
  public get unit() {
    return this.props.unit;
  }
  public get assetId() {
    return this.props.assetId;
  }
  public get isStep() {
    return this.props.isStep;
  }
  public get description() {
    return this.props.description;
  }
  public get securityCategories() {
    return this.props.securityCategories;
  }
  public get createdTime() {
    return this.props.createdTime;
  }
  public get lastUpdatedTime() {
    return this.props.lastUpdatedTime;
  }
  public get id() {
    return this.props.id;
  }

  constructor(client: CogniteClient, props: GetTimeSeriesMetadataDTO) {
    super(client, props);
  }

  /**
   * Deletes the current timeseries
   *
   * ```js
   * await timeseries.delete();
   * ```
   */
  public delete = async () => {
    return this.client.timeseries.delete([{ id: this.id }]);
  };

  /**
   * Retrieves the asset that the current timeseries is related to
   *
   * ```js
   * const assetList = await timeseries.getAsset();
   * ```
   */
  public getAsset = async () => {
    if (this.assetId === undefined) {
      return null;
    }
    const assetList = await this.client.assets.retrieve([{ id: this.assetId }]);
    return assetList[0];
  };

  /**
   * Retrieves all datapoints related to the current timeseries
   *
   * @param {DatapointsMultiQuery} options Query-options for datapoints
   * ```js
   * const datapoints = await timeseries.getDatapoints();
   * ```
   */
  public getDatapoints = async (options?: DatapointsMultiQuery) => {
    return this.client.datapoints.retrieve({
      items: [{ ...options, id: this.id }],
    });
  };

  /**
   * Retrieves the latest datapoints related to the current timeseries
   *
   * @param {LatestDataPropertyFilter} option Filter-options for latest datapoints
   * ```js
   * const latestDatapoints = await timeseries.getLatestDatapoints();
   * ```
   */
  public getLatestDatapoints = async (
    option: LatestDataPropertyFilter = {}
  ) => {
    const filter: LatestDataPropertyFilter = option;
    return this.client.datapoints.retrieveLatest([{ ...filter, id: this.id }]);
  };
}
