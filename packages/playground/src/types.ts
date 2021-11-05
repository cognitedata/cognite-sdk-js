// Copyright 2020 Cognite AS

import {
  CogniteExternalId,
  CogniteInternalId,
  FilterQuery,
} from '@cognite/sdk';

export * from './api/documents/shared';
export * from './api/documents/classifierTypes';
export * from './api/documents/feedbackTypes';
export * from './api/documents/previewTypes';
export * from './api/documents/pipelinesTypes';

// This file is here mostly to allow apis to import { ... } from '../../types';
// Overriding types should probably be done in their respective API endpoint files, where possible

export type FunctionStatus = 'Queued' | 'Deploying' | 'Ready' | 'Failed';

export type FileId = CogniteInternalId;

export interface CogniteFunctionError {
  code: number;
  message: string;
}
export interface Function {
  id: CogniteInternalId;
  createdTime: Date;
  status: FunctionStatus;
  name: string;
  externalId?: CogniteExternalId;
  fileId: FileId;
  owner?: string;
  description?: string;
  apiKey?: string;
  secrets?: Record<string, string>;
  functionPath?: string;
  envVars?: Record<string, string>;
  cpu?: number;
  memory?: number;
  error?: CogniteFunctionError;
}

export interface FunctionFilter {
  name?: string;
  owner?: string;
  fileId?: FileId;
  status?: FunctionStatus;
  externalIdPrefix?: string;
  createdTime?: Date;
}

export interface FunctionCreate {
  name: string;
  externalId?: CogniteExternalId;
  fileId: FileId;
  owner?: string;
  description?: string;
  apiKey?: string;
  secrets?: Record<string, string>;
  functionPath?: string;
  envVars?: Record<string, string>;
  cpu?: number;
  memory?: number;
}

export interface CallFunction {
  data: object;
  nonce: string;
}

export interface FunctionCallError {
  trace?: string;
  message: string;
}

export type FunctionCallStatus = 'Running' | 'Completed' | 'Failed' | 'Timeout';
export type FunctionId = CogniteInternalId;
export type FunctionCallId = CogniteInternalId;

export interface FunctionCall {
  id: CogniteInternalId;
  status: FunctionCallStatus;
  startTime: Date;
  endTime?: Date;
  error?: FunctionCallError;
  scheduleId?: CogniteInternalId;
  functionId: FunctionId;
  scheduledTime?: Date;
}

export interface FunctionCallFilter {
  scheduleId?: CogniteInternalId;
  status?: FunctionCallStatus;
  startTime?: Date;
  endTime?: Date;
}

export interface FunctionCallFilterQuery extends FilterQuery {
  filter?: FunctionCallFilter;
  limit?: number;
  cursor?: string;
}
export interface FunctionCallLogEntry {
  timestemp?: Date;
  message?: string;
}

export interface FunctionCallResponse {
  response: object;
  functionId: FunctionId;
  callId: FunctionCallId;
}

export interface FunctionScheduleCreate {
  name: string;
  description?: string;
  cronExpression: string;
  functionId?: FunctionId;
  functionExternalId?: string;
  data?: object;
  nonce?: string;
}

export interface FunctionSchedule {
  id: CogniteInternalId;
  name: string;
  createdTime: Date;
  description?: string;
  cronExpression: string;
  functionId?: FunctionId;
  functionExternalId?: string;
}

export interface FunctionSchedulesFilter {
  name?: string;
  FunctionId?: FunctionId;
  FunctionExternalId?: string;
  createdTime?: Date;
  cronExpression?: string;
}
