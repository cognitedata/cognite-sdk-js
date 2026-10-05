// Copyright 2026 Cognite AS

import type {
  CogniteExternalId,
  CogniteInternalId,
  FilterQuery,
} from '@cognite/sdk-core';

export type TransformationExternalDataFormat = 'one_lake' | 'snowflake';

export interface TransformationExternalDataOneLakeCredentials {
  clientId: string;
  tenantId: string;
  clientSecret: string;
}

export type TransformationExternalDataOneLakeCredentialsRead = Omit<
  TransformationExternalDataOneLakeCredentials,
  'clientSecret'
>;

export interface TransformationExternalDataOneLakeLocation {
  workspaceId: string;
  containerId: string;
}

export interface TransformationExternalDataOneLakeSettings {
  credentials: TransformationExternalDataOneLakeCredentials;
  locationDescription: TransformationExternalDataOneLakeLocation;
}

export interface TransformationExternalDataOneLakeSettingsRead {
  credentials: TransformationExternalDataOneLakeCredentialsRead;
  locationDescription: TransformationExternalDataOneLakeLocation;
}

export interface TransformationExternalDataSnowflakeCredentials {
  accountIdentifier: string;
  userName: string;
  roleName: string;
  expiryTime?: number;
}

export interface TransformationExternalDataSnowflakeCredentialsRead {
  accountIdentifier: string;
  userName: string;
  roleName: string;
  publicKey: string;
}

export interface TransformationExternalDataSnowflakeLocation {
  warehouseName: string;
}

export interface TransformationExternalDataSnowflakeSettings {
  credentials: TransformationExternalDataSnowflakeCredentials;
  locationDescription: TransformationExternalDataSnowflakeLocation;
}

export interface TransformationExternalDataSnowflakeSettingsRead {
  credentials: TransformationExternalDataSnowflakeCredentialsRead;
  locationDescription: TransformationExternalDataSnowflakeLocation;
}

export interface TransformationExternalDataOneLakeCreate {
  externalId: CogniteExternalId;
  name?: string;
  format: 'one_lake';
  dataSetId?: CogniteInternalId;
  settings: TransformationExternalDataOneLakeSettings;
}

export interface TransformationExternalDataSnowflakeCreate {
  externalId: CogniteExternalId;
  name?: string;
  format: 'snowflake';
  dataSetId?: CogniteInternalId;
  settings: TransformationExternalDataSnowflakeSettings;
}

export type TransformationExternalDataCreate =
  | TransformationExternalDataOneLakeCreate
  | TransformationExternalDataSnowflakeCreate;

export interface TransformationExternalDataOneLake {
  externalId: CogniteExternalId;
  name?: string;
  format: 'one_lake';
  dataSetId?: CogniteInternalId;
  settings: TransformationExternalDataOneLakeSettingsRead;
  createdTime: number;
  lastUpdatedTime: number;
}

export interface TransformationExternalDataSnowflake {
  externalId: CogniteExternalId;
  name?: string;
  format: 'snowflake';
  dataSetId?: CogniteInternalId;
  settings: TransformationExternalDataSnowflakeSettingsRead;
  expiryTime: number;
  createdTime: number;
  lastUpdatedTime: number;
}

export type TransformationExternalData =
  | TransformationExternalDataOneLake
  | TransformationExternalDataSnowflake;

export interface TransformationExternalDataListQuery extends FilterQuery {
  format?: TransformationExternalDataFormat;
}

export interface TransformationExternalDataDelete {
  externalId: CogniteExternalId;
}

export interface TransformationExternalDataUsabilityRequest {
  externalId: CogniteExternalId;
}

export interface TransformationExternalDataUsability {
  externalId: { externalId: CogniteExternalId };
  usableVersion?: string;
}

export interface TransformationExternalDataRotateKeysItem {
  externalId: CogniteExternalId;
  expiryTime: number;
}

export interface TransformationExternalDataRotatedKey {
  externalId: CogniteExternalId;
  publicKey: string;
  expiryTime: number;
}
