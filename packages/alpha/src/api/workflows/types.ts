// Copyright 2026 Cognite AS

import type {
  CogniteExternalId,
  CogniteInternalId,
  FilterQuery,
} from '@cognite/sdk-core';

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

/** JSON-serializable values used in workflow task parameters. */
export type JsonValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | JsonValue[]
  | { readonly [key: string]: JsonValue };

export enum TaskTypeEnum {
  FUNCTION = 'function',
  TRANSFORMATION = 'transformation',
  CDF = 'cdf',
  DYNAMIC = 'dynamic',
  SUBWORKFLOW = 'subworkflow',
  SIMULATION = 'simulation',
}

export type TaskTypes = `${TaskTypeEnum}` | string;

export enum ConcurrencyPolicyTypeEnum {
  FAIL = 'fail',
  WAIT_FOR_CURRENT = 'waitForCurrent',
  RESTART_AFTER_CURRENT = 'restartAfterCurrent',
}

export type ConcurrencyPolicyType = `${ConcurrencyPolicyTypeEnum}`;

export enum CdfRequestMethodTypesEnum {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
}

export type CdfRequestMethodTypes = `${CdfRequestMethodTypesEnum}` | string;

export enum CdfVersionHeaderEnum {
  NONE = '',
  ALPHA = 'alpha',
  BETA = 'beta',
}

export type CdfVersionHeader = `${CdfVersionHeaderEnum}`;

export type FunctionTaskParameters = {
  function?: {
    externalId?: string;
    data?: JsonValue;
  };
  isAsyncComplete?: boolean;
};

export type TransformationTaskParameters = {
  transformation?: {
    externalId?: string;
    concurrencyPolicy?: ConcurrencyPolicyType;
    useTransformationCredentials?: boolean;
  };
};

export type DynamicTaskParameters = {
  dynamic?: {
    tasks?: string;
  };
};

export type CdfRequestTaskParameters = {
  cdfRequest?: {
    resourcePath?: string;
    queryParameters?: JsonValue;
    method?: CdfRequestMethodTypes;
    body?: JsonValue;
    requestTimeoutInMillis?: number;
    cdfVersionHeader?: CdfVersionHeader | string;
  };
};

export type SimulationTaskParameters = {
  simulation?: {
    routineExternalId?: string;
    runTime?: number;
    inputs?: JsonValue[];
  };
};

export type SubworkflowTaskParameters = {
  subworkflow: {
    tasks?: TaskDefinition[];
    workflowExternalId?: string;
    version?: string;
  };
};
export type TaskParameters =
  | FunctionTaskParameters
  | TransformationTaskParameters
  | DynamicTaskParameters
  | SubworkflowTaskParameters
  | CdfRequestTaskParameters
  | SimulationTaskParameters
  | Record<string, unknown>;

export enum OnFailureTypeEnum {
  ABORT_WORKFLOW = 'abortWorkflow',
  SKIP_TASK = 'skipTask',
}

export type OnFailureType = `${OnFailureTypeEnum}`;

export type TaskDependency = {
  externalId: string;
};
export type TaskDefinition = {
  externalId: string;
  type: TaskTypes;
  name?: string;
  description?: string;
  parameters?: TaskParameters;
  retries?: number;
  timeout?: number;
  dependsOn?: TaskDependency[];
  onFailure?: OnFailureType;
};

export type WorkflowDefinition = {
  hash: string;
  description?: string;
  tasks: TaskDefinition[];
};

export type Version = {
  workflowExternalId: CogniteExternalId;
  version: string;
  description?: string;
  createdTime?: number;
  lastUpdatedTime?: number;
  workflowDefinition: WorkflowDefinition;
};

export type VersionDelete = {
  workflowExternalId: CogniteExternalId;
  version: string;
};

export type WorkflowDefinitionCreate = Pick<
  WorkflowDefinition,
  'description' | 'tasks'
>;

export type VersionUpsert = {
  workflowExternalId: CogniteExternalId;
  version: string;
  workflowDefinition: WorkflowDefinitionCreate;
};

export interface WorkflowVersionWorkflowFilter {
  externalId: CogniteExternalId;
  version?: string;
}

export interface WorkflowVersionFilter {
  workflowFilters?: WorkflowVersionWorkflowFilter[];
}

export interface WorkflowVersionFilterQuery extends FilterQuery {
  filter?: WorkflowVersionFilter;
}

export type FunctionOutput = {
  callId: number;
  functionId: number;
  response: object;
};

export type TransformationOutput = {
  jobId: number;
};

export type SimulationOutput = {
  runId: number;
  logId: number;
};

type CdfResponseOutput = {
  response: string | object;
  statusCode: number;
};

type DynamicTaskOutput = {
  dynamicTasks: TaskDefinition[];
};

type EmptyTaskOutput = Record<string, never>; // Represents an empty output type for tasks that do not produce any output

export type OutputType =
  | FunctionOutput
  | TransformationOutput
  | CdfResponseOutput
  | DynamicTaskOutput
  | SimulationOutput
  | EmptyTaskOutput;

export type WorkflowExecutionStatus =
  | 'RUNNING'
  | 'COMPLETED'
  | 'FAILED'
  | 'TIMED_OUT'
  | 'TERMINATED';

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

export interface WorkflowExecution {
  id: string;
  workflowExternalId: CogniteExternalId;
  status: WorkflowExecutionStatus;
  engineExecutionId: string;
  createdTime?: number;
  metadata: object;
  version: string;
  startTime?: number;
  endTime?: number;
  reasonForIncompletion?: string;
}

export interface WorkflowTaskExecution {
  id: string;
  externalId?: string;
  status: WorkflowTaskExecutionStatus;
  taskType: TaskTypes;
  input: TaskParameters;
  output: OutputType;
  parentTaskExternalId?: string | null;
  startTime?: number;
  endTime?: number;
  eventTime?: number;
  reasonForIncompletion?: string;
}

export interface WorkflowExecutionDetails extends WorkflowExecution {
  workflowDefinition: WorkflowDefinition;
  executedTasks: WorkflowTaskExecution[];
  input?: Record<string, JsonValue>;
}

export interface WorkflowExecutionWorkflowFilter {
  externalId: CogniteExternalId;
  version?: string;
}

export interface WorkflowExecutionFilter {
  workflowFilters?: WorkflowExecutionWorkflowFilter[];
  createdTimeStart?: number;
  createdTimeEnd?: number;
  status?: WorkflowExecutionStatus[];
}

export interface WorkflowExecutionFilterQuery extends FilterQuery {
  filter?: WorkflowExecutionFilter;
}

export interface WorkflowExecutionAuthentication {
  nonce: string;
}

export interface WorkflowExecutionRunRequest {
  authentication: WorkflowExecutionAuthentication;
  input?: Record<string, JsonValue>;
  metadata?: Record<string, string>;
}

export interface WorkflowExecutionRetryRequest {
  authentication: WorkflowExecutionAuthentication;
}

export interface WorkflowExecutionCancelRequest {
  reason?: string;
}
