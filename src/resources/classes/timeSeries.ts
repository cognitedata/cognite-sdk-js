// Copyright 2019 Cognite AS
import { CogniteClient } from '../..';
import {
  CogniteExternalId,
  CogniteInternalId,
  DatapointsMultiQuery,
  GetTimeSeriesMetadataDTO,
  LatestDataPropertyFilter,
  Metadata,
} from '../../types/types';

export class TimeSeries implements GetTimeSeriesMetadataDTO {
  public externalId?: CogniteExternalId;
  public name?: string;
  public isString: boolean;
  public metadata?: Metadata;
  public unit?: string;
  public assetId?: CogniteInternalId;
  public isStep: boolean;
  public description: string;
  public securityCategories?: number[];
  public createdTime: Date;
  public lastUpdatedTime: Date;
  public id: CogniteInternalId;
  private client: CogniteClient;

  constructor(client: CogniteClient, props: GetTimeSeriesMetadataDTO) {
    this.externalId = props.externalId;
    this.name = props.name;
    this.isString = props.isString;
    this.metadata = props.metadata;
    this.unit = props.unit;
    this.assetId = props.assetId;
    this.isStep = props.isStep;
    this.description = props.description;
    this.securityCategories = props.securityCategories;
    this.createdTime = props.createdTime;
    this.lastUpdatedTime = props.lastUpdatedTime;
    this.id = props.id;
    this.client = client;
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
