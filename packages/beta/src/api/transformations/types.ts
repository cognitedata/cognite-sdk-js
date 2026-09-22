// Copyright 2026 Cognite AS

import type { CogniteExternalId, CogniteInternalId } from '@cognite/sdk-core';

export type TransformationExternalDataFormat = 'one_lake';

export interface TransformationExternalDataCredentials {
  clientId: string;
  tenantId: string;
  clientSecret: string;
}

export interface TransformationExternalDataCredentialsRead {
  clientId: string;
  tenantId: string;
}

export interface TransformationExternalDataLocation {
  workspaceId: string;
  containerId: string;
}

export interface TransformationExternalDataSettings {
  credentials: TransformationExternalDataCredentials;
  locationDescription: TransformationExternalDataLocation;
}

export interface TransformationExternalDataSettingsRead {
  credentials: TransformationExternalDataCredentialsRead;
  locationDescription: TransformationExternalDataLocation;
}

export interface TransformationExternalDataCreate {
  externalId: CogniteExternalId;
  name?: string;
  format: TransformationExternalDataFormat;
  dataSetId?: CogniteInternalId | null;
  settings: TransformationExternalDataSettings;
}

export interface TransformationExternalData {
  externalId: CogniteExternalId;
  name: string;
  format: TransformationExternalDataFormat;
  dataSetId?: CogniteInternalId;
  settings: TransformationExternalDataSettingsRead;
  createdTime: number;
  lastUpdatedTime: number;
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
