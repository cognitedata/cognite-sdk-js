// Copyright 2026 Cognite AS

import type { CogniteExternalId, FilterQuery } from '@cognite/sdk-core';
import type { EpochTimestamp } from '../../types.gen';

/**
 * A reference to a workflow input or task output, for example
 * `${workflow.input.myKey}` or `${myTask.output.myKey}`.
 */
export type WorkflowReference = string;

export type WorkflowTaskType =
  | 'function'
  | 'transformation'
  | 'cdf'
  | 'dynamic'
  | 'subworkflow'
  | 'simulation';

export interface WorkflowFunctionTaskParameters {
  function?: {
    externalId: CogniteExternalId | WorkflowReference;
    data?: Record<string, unknown> | WorkflowReference;
  };
  /**
   * Whether the function completes the task asynchronously by calling the
   * update task status endpoint.
   * @default false
   */
  isAsyncComplete?: boolean;
}

export type WorkflowTransformationConcurrencyPolicy =
  | 'fail'
  | 'waitForCurrent'
  | 'restartAfterCurrent';

export interface WorkflowTransformationTaskParameters {
  transformation?: {
    externalId: CogniteExternalId | WorkflowReference;
    /**
     * @default 'fail'
     */
    concurrencyPolicy?: WorkflowTransformationConcurrencyPolicy;
    /**
     * @default false
     */
    useTransformationCredentials?: boolean;
  };
}

export type WorkflowCdfRequestMethod = 'POST' | 'GET' | 'PUT';

export interface WorkflowCdfTaskParameters {
  cdfRequest?: {
    resourcePath: string | WorkflowReference;
    queryParameters?: Record<string, string> | WorkflowReference;
    method: WorkflowCdfRequestMethod | WorkflowReference;
    body?: Record<string, unknown> | WorkflowReference;
    requestTimeoutInMillis?: number | WorkflowReference;
    cdfVersionHeader?: 'alpha' | 'beta';
  };
}

export interface WorkflowDynamicTaskParameters {
  dynamic?: {
    /**
     * A reference to the task definitions to run, for example
     * `${myTask.output.tasks}`.
     */
    tasks?: WorkflowReference;
  };
}

export interface WorkflowSubworkflowTaskParameters {
  subworkflow?:
    | {
        /**
         * Between 1 and 100 tasks.
         */
        tasks: WorkflowTaskDefinition[];
      }
    | {
        workflowExternalId: CogniteExternalId;
        version: string;
      };
}

export interface WorkflowSimulationInput {
  referenceId: string;
  value: string | number | string[] | number[];
  unit?: { name?: string } | null;
}

export interface WorkflowSimulationTaskParameters {
  simulation?: {
    routineExternalId: CogniteExternalId;
    runTime?: number | null;
    /**
     * Up to 200 inputs.
     */
    inputs?: WorkflowSimulationInput[];
  };
}

export type WorkflowTaskParameters =
  | WorkflowFunctionTaskParameters
  | WorkflowTransformationTaskParameters
  | WorkflowCdfTaskParameters
  | WorkflowDynamicTaskParameters
  | WorkflowSubworkflowTaskParameters
  | WorkflowSimulationTaskParameters;

export type WorkflowTaskOnFailure = 'abortWorkflow' | 'skipTask';

export interface WorkflowTaskDependency {
  externalId: CogniteExternalId;
}

export interface WorkflowTaskDefinition {
  externalId: CogniteExternalId;
  type: WorkflowTaskType;
  name?: string;
  description?: string;
  parameters: WorkflowTaskParameters;
  /**
   * Between 0 and 10.
   * @default 3
   */
  retries?: number;
  /**
   * Timeout in seconds, between 100 and 43200.
   * @default 3600
   */
  timeout?: number;
  /**
   * @default 'abortWorkflow'
   */
  onFailure?: WorkflowTaskOnFailure;
  /**
   * Up to 100 dependencies.
   */
  dependsOn?: WorkflowTaskDependency[];
}

export interface WorkflowDefinition {
  hash: string;
  description?: string;
  tasks: WorkflowTaskDefinition[];
}

export interface WorkflowDefinitionUpsert {
  /**
   * Up to 500 characters.
   */
  description?: string;
  /**
   * Up to 100 tasks.
   */
  tasks: WorkflowTaskDefinition[];
}

export interface WorkflowVersion {
  workflowExternalId?: CogniteExternalId;
  version?: string;
  workflowDefinition?: WorkflowDefinition;
  createdTime?: EpochTimestamp;
  lastUpdatedTime?: EpochTimestamp;
}

export interface WorkflowVersionUpsert {
  workflowExternalId: CogniteExternalId;
  version: string;
  workflowDefinition: WorkflowDefinitionUpsert;
}

/**
 * A {@link WorkflowVersion} as returned from upsert, which may include
 * validation warnings about the workflow definition.
 */
export interface WorkflowVersionUpsertResponse extends WorkflowVersion {
  warnings?: string[] | null;
}

export interface WorkflowVersionId {
  workflowExternalId: CogniteExternalId;
  version: string;
}

export interface WorkflowVersionWorkflowFilter {
  externalId: CogniteExternalId;
  version?: string;
}

export interface WorkflowVersionFilter {
  /**
   * Up to 100 filters.
   */
  workflowFilters?: WorkflowVersionWorkflowFilter[];
}

export interface WorkflowVersionFilterQuery extends FilterQuery {
  filter?: WorkflowVersionFilter;
}
