// Copyright 2026 Cognite AS

import type {
  CogniteExternalId,
  CogniteInternalId,
  FilterQuery,
} from '@cognite/sdk-core';
import type { Range } from '../../types';
import type { EpochTimestamp } from '../../types.gen';

export type ExtractionPipelineRunStatus = 'success' | 'failure' | 'seen';

export interface ExtractionPipelineRun {
  id: CogniteInternalId;
  /**
   * Usually `'success'`, `'failure'` or `'seen'`.
   */
  status: string;
  /**
   * Error message.
   */
  message?: string;
  createdTime?: EpochTimestamp;
  /**
   * External ID of the extraction pipeline. Only returned by `create`.
   */
  externalId?: CogniteExternalId;
}

export interface ExtractionPipelineRunCreate {
  /**
   * External ID of the extraction pipeline. 1 to 255 characters.
   */
  externalId: CogniteExternalId;
  status: ExtractionPipelineRunStatus;
  /**
   * Error message. At most 1000 characters.
   */
  message?: string | null;
  createdTime?: EpochTimestamp | null;
}

export interface ExtractionPipelineRunListQuery extends FilterQuery {
  /**
   * External ID of the extraction pipeline.
   */
  externalId: CogniteExternalId;
}

export interface ExtractionPipelineRunMessageFilter {
  /**
   * Matches messages that contain this substring, ignoring case.
   */
  substring?: string;
}

export interface ExtractionPipelineRunFilter {
  /**
   * External ID of the extraction pipeline. 1 to 255 characters.
   */
  externalId: CogniteExternalId;
  statuses?: ExtractionPipelineRunStatus[];
  createdTime?: Range<EpochTimestamp>;
  message?: ExtractionPipelineRunMessageFilter;
}

export interface ExtractionPipelineRunFilterQuery extends FilterQuery {
  filter: ExtractionPipelineRunFilter;
}
