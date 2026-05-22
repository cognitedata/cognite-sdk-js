// Copyright 2026 Cognite AS

import type { CogniteExternalId, CogniteInternalId } from '@cognite/sdk-core';

export interface Workflow {
  externalId: CogniteExternalId;
  description?: string;
  dataSetId?: CogniteInternalId;
  maxConcurrentExecutions?: number;
  createdTime?: number;
  lastUpdatedTime: number;
}

export interface WorkflowUpsert {
  externalId: CogniteExternalId;
  description?: string;
  dataSetId?: CogniteInternalId;
  maxConcurrentExecutions?: number;
}

export interface WorkflowExternalId {
  externalId: CogniteExternalId;
}
