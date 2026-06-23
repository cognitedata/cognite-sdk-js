// Copyright 2026 Cognite AS

import type {
  CogniteExternalId,
  FilterQuery,
  ListResponse,
} from '@cognite/sdk-core';

export type DataProductExternalId = CogniteExternalId;

export interface DataProduct {
  externalId: DataProductExternalId;
  name: string;
  schemaSpace: string;
  description?: string;
  isGoverned: boolean;
  tags: string[];
  domains: string[];
  createdTime: Date;
  lastUpdatedTime: Date;
}

export interface DataProductCreate {
  externalId: DataProductExternalId;
  name: string;
  schemaSpace?: string;
  description?: string;
  isGoverned?: boolean;
  tags?: string[];
}

export interface DataProductDelete {
  externalId: DataProductExternalId;
}

export interface DataProductPatch {
  name?: { set: string };
  description?: { set: string } | { setNull: boolean };
  isGoverned?: { set: boolean };
  tags?: { set: string[] } | { add?: string[]; remove?: string[] };
}

export interface DataProductChange extends DataProductDelete {
  update: DataProductPatch;
}

export interface DataProductListQuery extends FilterQuery {}

export type DataProductListResponse = ListResponse<DataProduct[]>;

export type DataProductVersionStatus =
  | 'draft'
  | 'published'
  | 'deprecated';

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
  version: string;
  views: DataProductViewReference[];
  status: DataProductVersionStatus;
  description?: string;
  terms: DataProductVersionTerms;
  createdTime: Date;
  lastUpdatedTime: Date;
}

export interface DataProductVersionCreate {
  version: string;
  views: DataProductViewReference[];
  status?: DataProductVersionStatus;
  description?: string;
  terms?: DataProductVersionTerms;
}

export interface DataProductVersionDelete {
  version: string;
}

export interface DataProductVersionTermsPatch {
  modify?: {
    usage?: { set: string };
    limitations?: { set: string };
  };
}

export interface DataProductVersionPatch {
  status?: { set: DataProductVersionStatus };
  description?: { set: string } | { setNull: boolean };
  terms?: DataProductVersionTermsPatch;
  views?: { add: DataProductViewReference[] };
}

export interface DataProductVersionChange {
  version: string;
  update: DataProductVersionPatch;
}

export interface DataProductVersionListQuery extends FilterQuery {}
