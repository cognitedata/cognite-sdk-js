// Copyright 2026 Cognite AS

import type { CogniteExternalId, FilterQuery } from '@cognite/sdk-core';
import type { EpochTimestamp } from '../../types.gen';
import type { WorkflowTaskExecution } from './workflowTaskTypes';
import type { WorkflowAuthentication } from './workflowTypes';
import type { WorkflowDefinition } from './workflowVersionTypes';

export type WorkflowExecutionId = string;

export type WorkflowExecutionStatus =
  | 'RUNNING'
  | 'COMPLETED'
  | 'FAILED'
  | 'TIMED_OUT'
  | 'TERMINATED';

export interface WorkflowExecution {
  id: WorkflowExecutionId;
  workflowExternalId: CogniteExternalId;
  version?: string;
  status: WorkflowExecutionStatus;
  engineExecutionId: string;
  createdTime: EpochTimestamp;
  startTime?: EpochTimestamp;
  endTime?: EpochTimestamp;
  reasonForIncompletion?: string;
  metadata: Record<string, string>;
}

export interface WorkflowExecutionDetailed extends WorkflowExecution {
  workflowDefinition: WorkflowDefinition;
  executedTasks: WorkflowTaskExecution[];
  input?: Record<string, unknown>;
}

export interface WorkflowExecutionRunRequest {
  authentication: WorkflowAuthentication;
  input?: Record<string, unknown>;
  metadata?: Record<string, string>;
}

export interface WorkflowExecutionRetryRequest {
  authentication: WorkflowAuthentication;
}

export interface WorkflowExecutionCancelRequest {
  /**
   * Up to 500 characters.
   * @default 'cancelled'
   */
  reason?: string;
}

export interface WorkflowExecutionWorkflowFilter {
  externalId: CogniteExternalId;
  version?: string;
}

export interface WorkflowExecutionFilter {
  /**
   * Between 1 and 100 filters.
   */
  workflowFilters?: WorkflowExecutionWorkflowFilter[];
  createdTimeStart?: EpochTimestamp;
  createdTimeEnd?: EpochTimestamp;
  status?: WorkflowExecutionStatus[];
}

export interface WorkflowExecutionFilterQuery extends FilterQuery {
  filter?: WorkflowExecutionFilter;
}
