// Copyright 2026 Cognite AS

import type { CogniteExternalId, FilterQuery } from '@cognite/sdk-core';
import type {
  ArrayPatchString,
  SetField,
  SinglePatchRequired,
  SinglePatchRequiredString,
  SinglePatchString,
} from '../../types';
import type { EpochTimestamp } from '../../types.gen';

export type DataProductExternalId = CogniteExternalId;

export interface DataProduct {
  externalId: DataProductExternalId;
  name: string;
  /**
   * The schema space where the data product's data modeling views are located.
   * This space is exclusively owned by this data product.
   */
  schemaSpace: string;
  description?: string;
  isGoverned: boolean;
  tags: string[];
  /**
   * External IDs of the data domains this data product is derived from.
   */
  domains: string[];
  createdTime: EpochTimestamp;
  lastUpdatedTime: EpochTimestamp;
}

export interface DataProductCreate {
  externalId: DataProductExternalId;
  name: string;
  /**
   * Defaults to a space with the same name as the data product's `externalId`.
   * The space must exist and not be owned by another data product.
   */
  schemaSpace?: string;
  description?: string;
  isGoverned?: boolean;
  tags?: string[];
}

export interface DataProductExternalIdObject {
  externalId: DataProductExternalId;
}

export interface DataProductPatch {
  name?: SinglePatchRequiredString;
  description?: SinglePatchString;
  isGoverned?: SetField<boolean>;
  tags?: ArrayPatchString;
}

export interface DataProductChange extends DataProductExternalIdObject {
  update: DataProductPatch;
}

export interface DataProductListQuery extends FilterQuery {}

/**
 * Semantic version in the form `major.minor.patch`, for example `1.2.34`.
 */
export type DataProductSemanticVersion = string;

export type DataProductVersionStatus = 'draft' | 'published' | 'deprecated';

export interface DataProductViewReference {
  space: string;
  externalId: string;
  version: string;
}

export interface DataProductVersionTerms {
  usage?: string;
  limitations?: string;
}

export interface DataProductVersion {
  version: DataProductSemanticVersion;
  views: DataProductViewReference[];
  status: DataProductVersionStatus;
  description?: string;
  terms: DataProductVersionTerms;
  createdTime: EpochTimestamp;
  lastUpdatedTime: EpochTimestamp;
}

export interface DataProductVersionCreate {
  version: DataProductSemanticVersion;
  views: DataProductViewReference[];
  status?: DataProductVersionStatus;
  description?: string;
  terms?: DataProductVersionTerms;
}

export interface DataProductVersionIdentifier {
  version: DataProductSemanticVersion;
}

export interface DataProductVersionTermsPatch {
  modify?: {
    usage?: SinglePatchString;
    limitations?: SinglePatchString;
  };
}

export interface DataProductVersionPatch {
  status?: SinglePatchRequired<DataProductVersionStatus>;
  description?: SinglePatchString;
  terms?: DataProductVersionTermsPatch;
  views?: { add: DataProductViewReference[] };
}

export interface DataProductVersionChange extends DataProductVersionIdentifier {
  update: DataProductVersionPatch;
}

export interface DataProductVersionListQuery extends FilterQuery {}
