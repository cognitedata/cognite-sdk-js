// Copyright 2026 Cognite AS

import type {
  SinglePatchRequiredString,
  SinglePatchString,
} from '@cognite/sdk';
import type { CogniteExternalId, FilterQuery } from '@cognite/sdk-core';

export type DataDomainExternalId = CogniteExternalId;

export interface DataDomain {
  externalId: DataDomainExternalId;
  name: string;
  description?: string;
}

export interface DataDomainCreate {
  externalId: DataDomainExternalId;
  name: string;
  description?: string;
}

export interface DataDomainExternalIdObject {
  externalId: DataDomainExternalId;
}

export interface DataDomainPatch {
  name?: SinglePatchRequiredString;
  description?: SinglePatchString;
}

export interface DataDomainChange extends DataDomainExternalIdObject {
  update: DataDomainPatch;
}

export interface DataDomainListQuery extends FilterQuery {}
