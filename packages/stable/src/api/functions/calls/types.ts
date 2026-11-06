// Copyright 2026 Cognite AS

import type { CogniteInternalId, FilterQuery } from '@cognite/sdk-core';
import type { Range } from '../../../types';
import type { EpochTimestamp } from '../../../types.gen';

/**
 * Status of a function call.
 */
export type FunctionCallStatus =
  | 'Running'
  | 'Completed'
  | 'Failed'
  | 'Timeout'
  | 'ConcurrencyLimitExceeded';

export interface FunctionCall {
  id: CogniteInternalId;
  status: FunctionCallStatus;
  startTime: EpochTimestamp;
  endTime?: EpochTimestamp;
  /**
   * Error message when the call status is `Failed`, `Timeout`, or `ConcurrencyLimitExceeded`.
   */
  error?: string;
  scheduleId?: CogniteInternalId;
  functionId: CogniteInternalId;
  scheduledTime?: EpochTimestamp;
}

export interface FunctionCallRequest {
  /**
   * Passed to the function's `handle()` as the `data` argument.
   * Don't put secrets here; use the function's `secrets` instead.
   */
  data?: object;
  /**
   * Nonce from `client.sessions.create`. The function runs with the
   * session's credentials.
   */
  nonce: string;
}

export interface FunctionCallFilter {
  scheduleId?: CogniteInternalId;
  status?: FunctionCallStatus;
  /**
   * Inclusive range of epoch milliseconds.
   */
  startTime?: Range<EpochTimestamp>;
  /**
   * Inclusive range of epoch milliseconds.
   */
  endTime?: Range<EpochTimestamp>;
}

export interface FunctionCallFilterQuery extends FilterQuery {
  filter?: FunctionCallFilter;
}

export interface FunctionCallResponse {
  /**
   * The value returned by the function's `handle()`. Not present if the function returned nothing.
   */
  response?: object;
  functionId: CogniteInternalId;
  callId: CogniteInternalId;
}

export interface FunctionCallLogEntry {
  timestamp?: EpochTimestamp;
  /**
   * Single line from stdout or stderr.
   */
  message?: string;
}
