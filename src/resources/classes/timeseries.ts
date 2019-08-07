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
  public client: CogniteClient;

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

  public delete = async () => {
    return this.client.timeseries.delete([{ id: this.id }]);
  };

  public getAsset = async () => {
    if (this.assetId === undefined) {
      return null;
    }
    return this.client.assets.retrieve([{ id: this.assetId }]);
  };

  public getDatapoints = async (options?: DatapointsMultiQuery) => {
    return this.client.datapoints.retrieve({
      items: [{ id: this.id, ...options }],
    });
  };

  public getLatestDatapoints = async (option?: LatestDataPropertyFilter) => {
    const filter: LatestDataPropertyFilter = option || {};
    return this.client.datapoints.retrieveLatest([{ ...filter, id: this.id }]);
  };
}
