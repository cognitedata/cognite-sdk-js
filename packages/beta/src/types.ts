// Copyright 2020 Cognite AS

import {
  InternalId,
  CreatedAndLastUpdatedTime,
  CogniteExternalId,
  TimeseriesName,
  TimeseriesIsString,
  Metadata,
  TimeseriesUnit,
  CogniteInternalId,
  TimeseriesIsStep,
} from '@cognite/sdk';
export * from '@cognite/sdk';

export interface Timeseries extends InternalId, CreatedAndLastUpdatedTime {
  /**
   * Externally supplied id of the time series
   */
  externalId?: CogniteExternalId;
  name?: TimeseriesName;
  isString: TimeseriesIsString;
  /**
   * Additional metadata. String key -> String value.
   */
  metadata?: Metadata;
  unit?: TimeseriesUnit;
  /**
   * Asset that this time series belongs to.
   */
  assetId?: CogniteInternalId;
  dataSetId?: CogniteInternalId;
  isStep: TimeseriesIsStep;
  /**
   * Description of the time series.
   */
  description: string;
  /**
   * Security categories required in order to access this time series.
   */
  securityCategories?: number[];
  /**
   * Field added only in beta
   */
  myBetaField: string;
}
