// Copyright 2026 Cognite AS

import type { CogniteExternalId, CogniteInternalId } from '@cognite/sdk-core';
import type { EpochTimestamp } from '../../types.gen';

export interface Workflow {
  externalId: CogniteExternalId;
  description?: string;
  dataSetId?: CogniteInternalId;
  /**
   * Maximum number of concurrent executions of this workflow, between 1 and 10000.
   */
  maxConcurrentExecutions?: number | null;
  createdTime: EpochTimestamp;
  lastUpdatedTime: EpochTimestamp;
}

export interface WorkflowUpsert {
  externalId: CogniteExternalId;
  /**
   * Up to 500 characters.
   */
  description?: string;
  dataSetId?: CogniteInternalId;
  /**
   * Maximum number of concurrent executions of this workflow, between 1 and 10000.
   */
  maxConcurrentExecutions?: number | null;
}

export interface WorkflowExternalId {
  externalId: CogniteExternalId;
}
