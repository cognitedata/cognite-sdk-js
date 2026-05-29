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

export enum ConcurrencyPolicyTypeEnum {
  FAIL = 'fail',
  WAIT_FOR_CURRENT = 'waitForCurrent',
  RESTART_AFTER_CURRENT = 'restartAfterCurrent',
}

export enum CdfRequestMethodTypesEnum {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
}

export enum CdfVersionHeaderEnum {
  NONE = '',
  ALPHA = 'alpha',
  BETA = 'beta',
}

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
    concurrencyPolicy?: ConcurrencyPolicyTypeEnum;
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
    method?: CdfRequestMethodTypesEnum | string;
    body?: JsonValue;
    requestTimeoutInMillis?: number;
    cdfVersionHeader?: CdfVersionHeaderEnum | string;
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
export type TaskDependency = {
  externalId: string;
};
export type TaskDefinition = {
  externalId: string;
  type: TaskTypeEnum | string;
  name?: string;
  description?: string;
  parameters?: TaskParameters;
  retries?: number;
  timeout?: number;
  dependsOn?: TaskDependency[];
  onFailure?: OnFailureTypeEnum;
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
