// Copyright 2026 Cognite AS

import type {
  ContainerReference,
  FilterDefinition,
  ViewReference,
  WorkflowAuthentication,
  WorkflowExecutionRunRequest as WorkflowExecutionRunRequestStable,
  WorkflowExecutionStatus,
  Workflow as WorkflowStable,
  WorkflowTaskExecutionStatus,
  WorkflowUpsert as WorkflowUpsertStable,
} from '@cognite/sdk';
import type { CogniteExternalId, CogniteInstanceId } from '@cognite/sdk-core';

interface WorkflowAlphaFields {
  dataDomainExternalId?: CogniteExternalId;
  isDataAware?: boolean;
}

export interface Workflow extends WorkflowStable, WorkflowAlphaFields {}

export interface WorkflowUpsert
  extends WorkflowUpsertStable,
    WorkflowAlphaFields {}

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

/** A reference to a container or view data store. */
export type DataStore =
  | Pick<ContainerReference, 'type' | 'space' | 'externalId'>
  | Pick<ViewReference, 'type' | 'space' | 'externalId' | 'version'>;

/** A filter expression, or an empty object for no filter. */
export type DataSelectorFilter = FilterDefinition | Record<string, never>;

/** Specifies a data store and the properties to read from or write to. */
export type DataStorePropertySpec = {
  dataStore: DataStore;
  properties: string[];
};

/** Selects data using a filter and property sources. */
export type DataSelectorPayload = {
  filter: DataSelectorFilter;
  sources: DataStorePropertySpec[];
};

/** Specifies the properties written to a target data node. */
export type DataSpecPayload = {
  properties: DataStorePropertySpec[];
};

/** A source data node that reads from DMS. */
export type SourceDataNode = {
  externalId: string;
  type: 'nodes';
  name?: string;
  description?: string;
  retries?: number;
  timeout?: number;
  onFailure?: OnFailureType;
  dataSelector: DataSelectorPayload;
};

/** A target data node that writes into DMS. */
export type TargetDataNode = {
  externalId: string;
  type: 'nodes';
  name?: string;
  description?: string;
  retries?: number;
  timeout?: number;
  onFailure?: OnFailureType;
  dependsOn: TaskDependency[];
  dataSpec: DataSpecPayload;
};

/** Sources and targets for a data-aware workflow. */
export type DataDefinition = {
  sources: SourceDataNode[];
  targets: TargetDataNode[];
};

export const VALIDATION_OPERATORS = [
  'EQ',
  'GT',
  'GTE',
  'LT',
  'LTE',
  'STARTS_WITH',
  'ENDS_WITH',
  'CONTAINS',
] as const;

export type ValidationOperator = (typeof VALIDATION_OPERATORS)[number];

export type ValidationRule = {
  property: string;
  operator: ValidationOperator;
  value: string | number | boolean;
};

/** Acceptance rules for task output in a data-aware workflow. */
export type ValidationDefinition = {
  externalId: string;
  name?: string;
  description?: string;
  dependsOn: TaskDependency[];
  targetExternalId: string;
  rules: ValidationRule[];
  flowsApp?: {
    externalId: string;
  };
};

export type WorkflowDefinition = {
  hash: string;
  description?: string;
  tasks: TaskDefinition[];
  data?: DataDefinition;
  validation?: ValidationDefinition;
};

export type Version = {
  workflowExternalId: CogniteExternalId;
  version: string;
  description?: string;
  createdTime?: number;
  lastUpdatedTime?: number;
  workflowDefinition: WorkflowDefinition;
};

/** A {@link Version} as returned from the upsert endpoint, which may include validation warnings about the workflow definition. */
export type VersionUpsertResponse = Version & {
  warnings?: string[];
};

export type VersionDelete = {
  workflowExternalId: CogniteExternalId;
  version: string;
};

export type WorkflowDefinitionCreate = Pick<
  WorkflowDefinition,
  'description' | 'tasks' | 'data' | 'validation'
>;

export type VersionUpsert = {
  workflowExternalId: CogniteExternalId;
  version: string;
  workflowDefinition: WorkflowDefinitionCreate;
};

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

/**
 * The execution type of the deprecated `client.workflowExecutions`.
 * `client.workflows.executions` returns the stable `WorkflowExecution`.
 */
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

/**
 * The task execution type of the deprecated `client.workflowExecutions`.
 * `client.workflows.executions` returns the stable `WorkflowTaskExecution`.
 */
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

/**
 * @deprecated Use `WorkflowExecutionDetailed`, returned by
 * `client.workflows.executions.retrieve`.
 */
export interface WorkflowExecutionDetails extends WorkflowExecution {
  workflowDefinition: WorkflowDefinition;
  executedTasks: WorkflowTaskExecution[];
  input?: Record<string, JsonValue>;
}

/** Alpha extension of the stable run request with DMS instance items. */
export interface WorkflowExecutionRunRequest
  extends WorkflowExecutionRunRequestStable {
  items?: CogniteInstanceId[];
}

export interface ManualWorkflowTriggerRule {
  triggerType: 'manual';
}

export interface ScheduleWorkflowTriggerRule {
  triggerType: 'schedule';
  cronExpression: string;
  timezone?: string;
}

export interface DataModelingWorkflowTriggerRule {
  triggerType: 'dataModeling';
  dataModelingQuery: {
    with: Record<string, unknown>;
    select: Record<string, unknown>;
  };
  batchSize: number;
  batchTimeout: number;
}

export interface RecordStreamWorkflowTriggerRule {
  triggerType: 'recordStream';
  streamExternalId: string;
  batchSize: number;
  batchTimeout: number;
  filter?: JsonValue;
  sources?: JsonValue;
  initializeCursor?: string | null;
}

export type WorkflowTriggerRule =
  | ManualWorkflowTriggerRule
  | ScheduleWorkflowTriggerRule
  | DataModelingWorkflowTriggerRule
  | RecordStreamWorkflowTriggerRule;

export type WorkflowTriggerUpsertRule = Exclude<
  WorkflowTriggerRule,
  ManualWorkflowTriggerRule
>;

interface WorkflowTriggerRequestBase<Rule extends WorkflowTriggerRule> {
  externalId: CogniteExternalId;
  triggerRule: Rule;
  workflowExternalId: CogniteExternalId;
  workflowVersion: string;
  authentication: WorkflowAuthentication;
  input?: Record<string, JsonValue>;
  metadata?: Record<string, string>;
}

interface WorkflowTriggerBase<Rule extends WorkflowTriggerRule> {
  externalId: CogniteExternalId;
  triggerRule: Rule;
  workflowExternalId: CogniteExternalId;
  workflowVersion: string;
  input?: Record<string, JsonValue>;
  metadata?: Record<string, string>;
  createdTime?: number;
  lastUpdatedTime?: number;
  isPaused?: boolean;
}

export type ManualWorkflowTrigger =
  WorkflowTriggerBase<ManualWorkflowTriggerRule>;

export type ScheduleWorkflowTrigger =
  WorkflowTriggerBase<ScheduleWorkflowTriggerRule>;

export type DataModelingWorkflowTrigger =
  WorkflowTriggerBase<DataModelingWorkflowTriggerRule>;

export type RecordStreamWorkflowTrigger =
  WorkflowTriggerBase<RecordStreamWorkflowTriggerRule>;

export type WorkflowTrigger =
  | ManualWorkflowTrigger
  | ScheduleWorkflowTrigger
  | DataModelingWorkflowTrigger
  | RecordStreamWorkflowTrigger;

export type WorkflowTriggerUpsert =
  WorkflowTriggerRequestBase<WorkflowTriggerUpsertRule>;
