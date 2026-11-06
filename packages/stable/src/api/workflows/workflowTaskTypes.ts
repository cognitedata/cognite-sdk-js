// Copyright 2026 Cognite AS

import type { CogniteExternalId } from '@cognite/sdk-core';
import type { EpochTimestamp } from '../../types.gen';
import type {
  WorkflowCdfTaskParameters,
  WorkflowDynamicTaskParameters,
  WorkflowFunctionTaskParameters,
  WorkflowSimulationInput,
  WorkflowTaskDefinition,
  WorkflowTaskType,
  WorkflowTransformationTaskParameters,
} from './workflowVersionTypes';

export type WorkflowTaskExecutionId = string;

export type WorkflowTaskExecutionStatus =
  | 'IN_PROGRESS'
  | 'CANCELED'
  | 'FAILED'
  | 'FAILED_WITH_TERMINAL_ERROR'
  | 'COMPLETED'
  | 'COMPLETED_WITH_ERRORS'
  | 'SCHEDULED'
  | 'TIMED_OUT'
  | 'SKIPPED';

export type WorkflowTaskExecutionInput =
  | WorkflowFunctionTaskParameters
  | WorkflowTransformationTaskParameters
  | WorkflowCdfTaskParameters
  | WorkflowDynamicTaskParameters
  | WorkflowSimulationInput;

export interface WorkflowFunctionTaskOutput {
  callId?: number;
  functionId?: number;
  response?: Record<string, unknown>;
}

export interface WorkflowTransformationTaskOutput {
  jobId?: number;
}

export interface WorkflowCdfTaskOutput {
  response?: string | Record<string, unknown>;
  statusCode?: number;
}

export interface WorkflowDynamicTaskOutput {
  /**
   * Up to 100 tasks.
   */
  dynamicTasks?: WorkflowTaskDefinition[];
}

export interface WorkflowSimulationTaskOutput {
  runId?: number;
  logId?: number;
  statusMessage?: string;
}

export type WorkflowTaskOutput =
  | WorkflowFunctionTaskOutput
  | WorkflowTransformationTaskOutput
  | WorkflowCdfTaskOutput
  | WorkflowDynamicTaskOutput
  | WorkflowSimulationTaskOutput;

export interface WorkflowTaskExecution {
  id: WorkflowTaskExecutionId;
  externalId: CogniteExternalId;
  parentTaskExternalId?: CogniteExternalId | null;
  status: WorkflowTaskExecutionStatus;
  taskType: WorkflowTaskType;
  startTime?: EpochTimestamp;
  endTime?: EpochTimestamp;
  input: WorkflowTaskExecutionInput;
  output: WorkflowTaskOutput;
  reasonForIncompletion?: string;
}

export type WorkflowTaskUpdateStatus =
  | 'COMPLETED'
  | 'FAILED'
  | 'FAILED_WITH_TERMINAL_ERROR';

export interface WorkflowTaskUpdate {
  status: WorkflowTaskUpdateStatus;
  output?: Record<string, unknown>;
}
