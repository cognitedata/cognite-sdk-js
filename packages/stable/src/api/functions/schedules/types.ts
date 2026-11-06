// Copyright 2026 Cognite AS

import type {
  CogniteExternalId,
  CogniteInternalId,
  Limit,
} from '@cognite/sdk-core';
import type { Range } from '../../../types';
import type { EpochTimestamp } from '../../../types.gen';
import type { SessionId } from '../../sessions/types';

export interface FunctionSchedule {
  id: CogniteInternalId;
  /**
   * Between 1 and 140 characters.
   */
  name: string;
  createdTime: EpochTimestamp;
  /**
   * At most 500 characters.
   */
  description?: string;
  /**
   * Cron expression that describes when the function is called.
   */
  cronExpression: string;
  /**
   * When the schedule triggers, in human-readable text.
   */
  when: string;
  functionId: CogniteInternalId;
  sessionId: SessionId;
}

export interface FunctionScheduleFilter {
  name?: string;
  /**
   * Set at most one of `functionId` and `functionExternalId`.
   */
  functionId?: CogniteInternalId;
  functionExternalId?: CogniteExternalId;
  createdTime?: Range<EpochTimestamp>;
  cronExpression?: string;
}

export interface FunctionScheduleListQuery extends Limit {
  filter?: FunctionScheduleFilter;
}

export interface FunctionScheduleInputData {
  id: CogniteInternalId;
  /**
   * Input data passed to the function. Not present if the schedule has none.
   */
  data?: Record<string, unknown>;
}
