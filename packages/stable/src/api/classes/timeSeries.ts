// Copyright 2020 Cognite AS
import CogniteClient from '../../cogniteClient';
import {
  CogniteExternalId,
  CogniteInternalId,
  DatapointsMultiQuery,
  GetTimeSeriesMetadataDTO,
  LatestDataPropertyFilter,
  Metadata,
} from '../../types';
import { BaseResource } from './baseResource';

export class TimeSeries extends BaseResource<GetTimeSeriesMetadataDTO>
  implements GetTimeSeriesMetadataDTO {
  public externalId?: CogniteExternalId;
  public name?: string;
  public isString: boolean;
  public metadata?: Metadata;
  public unit?: string;
  public assetId?: CogniteInternalId;
  public dataSetId?: CogniteInternalId;
  public isStep: boolean;
  public description: string;
  public securityCategories?: number[];
  public createdTime: Date;
  public lastUpdatedTime: Date;
  public id: CogniteInternalId;

  constructor(client: CogniteClient, props: GetTimeSeriesMetadataDTO) {
    super(client);
    this.externalId = props.externalId;
    this.name = props.name;
    this.isString = props.isString;
    this.metadata = props.metadata;
    this.unit = props.unit;
    this.assetId = props.assetId;
    this.dataSetId = props.dataSetId;
    this.isStep = props.isStep;
    this.description = props.description;
    this.securityCategories = props.securityCategories;
    this.createdTime = props.createdTime;
    this.lastUpdatedTime = props.lastUpdatedTime;
    this.id = props.id;

    Object.defineProperties(this, {
      delete: { value: this.delete.bind(this), enumerable: false },
      getAsset: { value: this.getAsset.bind(this), enumerable: false },
      getDatapoints: {
        value: this.getDatapoints.bind(this),
        enumerable: false,
      },
      getLatestDatapoints: {
        value: this.getLatestDatapoints.bind(this),
        enumerable: false,
      },
    });
  }

  /**
   * Deletes the current timeseries
   *
   * ```js
   * await timeseries.delete();
   * ```
   */
  public async delete() {
    return this.client.timeseries.delete([{ id: this.id }]);
  }

  /**
   * Retrieves the asset that the current timeseries is related to
   *
   * ```js
   * const assetList = await timeseries.getAsset();
   * ```
   */
  public async getAsset() {
    if (this.assetId === undefined) {
      return null;
    }
    const assetList = await this.client.assets.retrieve([{ id: this.assetId }]);
    return assetList[0];
  }

  /**
   * Retrieves all datapoints related to the current timeseries
   *
   * @param {DatapointsMultiQuery} options Query-options for datapoints
   * ```js
   * const datapoints = await timeseries.getDatapoints();
   * ```
   */
  public async getDatapoints(options?: DatapointsMultiQuery) {
    return this.client.datapoints.retrieve({
      items: [{ ...options, id: this.id }],
    });
  }

  /**
   * Retrieves the latest datapoints related to the current timeseries
   *
   * @param {LatestDataPropertyFilter} option Filter-options for latest datapoints
   * ```js
   * const latestDatapoints = await timeseries.getLatestDatapoints();
   * ```
   */
  public async getLatestDatapoints(option: LatestDataPropertyFilter = {}) {
    const filter: LatestDataPropertyFilter = option;
    return this.client.datapoints.retrieveLatest([
      { ...filter, id: this.id, before: 'now' },
    ]);
  }

  public toJSON() {
    return {
      ...this,
    };
  }
}
