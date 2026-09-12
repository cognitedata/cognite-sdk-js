// Copyright 2026 Cognite AS

import type {
  CogniteExternalId,
  CogniteInternalId,
  Cursor,
  CursorResponse,
  Limit,
} from '@cognite/sdk-core';

export interface Workflow {
  /**
   * External id of the workflow. Unique within the project.
   */
  externalId: CogniteExternalId;
  /**
   * Optional description of the workflow.
   */
  description?: string;
  /**
   * Data set the workflow is assigned to.
   */
  dataSetId?: CogniteInternalId;
  /**
   * Maximum number of executions of this workflow that may run concurrently.
   */
  maxConcurrentExecutions?: number;
  /**
   * The time the workflow was created.
   */
  createdTime: number;
  /**
   * The last time the workflow was updated.
   */
  lastUpdatedTime: number;
}

/**
 * Request body for creating or updating a workflow (upsert).
 */
export interface WorkflowUpsert {
  externalId: CogniteExternalId;
  description?: string;
  dataSetId?: CogniteInternalId;
  maxConcurrentExecutions?: number;
}

/**
 * Identifier used when deleting a workflow.
 */
export interface WorkflowExternalId {
  externalId: CogniteExternalId;
}

/**
 * Query parameters for listing workflows (`limit`, `cursor`).
 */
export type WorkflowListQuery = Cursor & Limit;

/**
 * Response for listing workflows.
 */
export type WorkflowList = CursorResponse<Workflow[]>;
