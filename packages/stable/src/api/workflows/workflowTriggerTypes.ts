// Copyright 2026 Cognite AS

import type { CogniteExternalId } from '@cognite/sdk-core';
import type { EpochTimestamp } from '../../types.gen';
import type {
  SyncSelectV3,
  SyncTableExpressionV3,
} from '../instances/types.gen';
import type { RecordFilter, SourceSelector } from '../records/types';
import type { WorkflowAuthentication } from './workflowTypes';

export interface WorkflowTriggerScheduleRule {
  triggerType: 'schedule';
  /**
   * A cron expression in UNIX format. The API may shift the exact time of
   * each run to spread the load, but keeps the frequency.
   */
  cronExpression: string;
  /**
   * IANA time zone the cron expression is evaluated in.
   * @default 'UTC'
   */
  timezone?: string;
}

/**
 * A data modeling sync query. The `limit` of each `with` expression that
 * `select` references must equal the trigger's `batchSize`.
 */
export interface WorkflowTriggerDataModelingQuery {
  with: Record<string, SyncTableExpressionV3>;
  select: Record<string, SyncSelectV3>;
}

export interface WorkflowTriggerDataModelingRule {
  triggerType: 'dataModeling';
  dataModelingQuery: WorkflowTriggerDataModelingQuery;
  /**
   * Maximum number of items per workflow execution, between 1 and 1000.
   */
  batchSize: number;
  /**
   * Maximum time in seconds to wait for a full batch, between 10 and 86400.
   */
  batchTimeout: number;
}

export interface WorkflowTriggerRecordStreamRule {
  triggerType: 'recordStream';
  streamExternalId: CogniteExternalId;
  filter?: RecordFilter;
  /**
   * Between 1 and 10 views or containers whose properties are passed as
   * workflow input.
   */
  sources?: SourceSelector[];
  /**
   * Where to start syncing when the trigger has no cursor yet, on the form
   * `<duration>-ago`, for example `2d-ago`.
   * @default '0d-ago'
   */
  initializeCursor?: string | null;
  /**
   * Maximum number of records per workflow execution, between 1 and 1000.
   */
  batchSize: number;
  /**
   * Maximum time in seconds to wait for a full batch, between 10 and 86400.
   */
  batchTimeout: number;
}

export type WorkflowTriggerRule =
  | WorkflowTriggerScheduleRule
  | WorkflowTriggerDataModelingRule
  | WorkflowTriggerRecordStreamRule;

export type WorkflowTriggerType = WorkflowTriggerRule['triggerType'];

interface WorkflowTriggerBase {
  externalId: CogniteExternalId;
  triggerRule: WorkflowTriggerRule;
  /**
   * Input to the workflow executions, up to 100 KB of JSON.
   */
  input?: Record<string, unknown>;
  /**
   * Metadata added to the executions started by the trigger. Up to 10
   * pairs, keys up to 32 characters and values up to 255.
   */
  metadata?: Record<string, string>;
  workflowExternalId: CogniteExternalId;
  workflowVersion: string;
}

export interface WorkflowTriggerUpsert extends WorkflowTriggerBase {
  authentication: WorkflowAuthentication;
}

export interface WorkflowTrigger extends WorkflowTriggerBase {
  createdTime: EpochTimestamp;
  lastUpdatedTime: EpochTimestamp;
  isPaused: boolean;
}

export interface WorkflowTriggerExternalId {
  externalId: CogniteExternalId;
}

/**
 * `success` means the trigger started an execution, `failed` means it could
 * not.
 */
export type WorkflowTriggerRunStatus = 'success' | 'failed';

export interface WorkflowTriggerRun {
  /**
   * When the trigger tried to start the execution.
   */
  fireTime: EpochTimestamp;
  externalId: CogniteExternalId;
  workflowExternalId: CogniteExternalId;
  workflowVersion: string;
  workflowExecutionId?: string | null;
  status: WorkflowTriggerRunStatus;
  /**
   * Why the run failed, `null` if it succeeded.
   */
  reasonForFailure?: string | null;
}
