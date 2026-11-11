// Copyright 2026 Cognite AS

import type {
  CogniteExternalId,
  CogniteInternalId,
  FilterQuery,
  IdEither,
} from '@cognite/sdk-core';
import type {
  Metadata,
  Range,
  SetField,
  SinglePatchRequiredString,
} from '../../types';
import type { EpochTimestamp } from '../../types.gen';

export interface ExtractionPipelineRawTable {
  dbName: string;
  tableName: string;
}

export interface ExtractionPipelineContact {
  name?: string | null;
  email?: string | null;
  role?: string | null;
  /**
   * Whether the contact receives email notifications.
   */
  sendNotification?: boolean | null;
}

export interface ExtractionPipelineNotificationConfiguration {
  /**
   * Minutes without any run before a notification is sent. `null` if the
   * extraction pipeline is not checked.
   */
  allowedNotSeenRangeInMinutes?: number | null;
}

export interface ExtractionPipelineCreate {
  /**
   * Must be unique within the project. 1 to 255 characters.
   */
  externalId: CogniteExternalId;
  /**
   * 1 to 140 characters.
   */
  name: string;
  /**
   * At most 500 characters.
   */
  description?: string | null;
  dataSetId: CogniteInternalId;
  rawTables?: ExtractionPipelineRawTable[] | null;
  /**
   * `'On trigger'`, `'Continuous'` or a cron expression.
   */
  schedule?: string | null;
  contacts?: ExtractionPipelineContact[] | null;
  /**
   * Up to 256 key-value pairs. Keys are at most 128 bytes, values at most
   * 10240 bytes, and the total size is at most 10240 bytes.
   */
  metadata?: Metadata;
  /**
   * At most 255 characters.
   */
  source?: string | null;
  /**
   * Markdown text. At most 10000 characters.
   */
  documentation?: string | null;
  notificationConfig?: ExtractionPipelineNotificationConfiguration;
  /**
   * Usually the creator's email. At most 255 characters.
   */
  createdBy?: string | null;
}

export interface ExtractionPipeline extends ExtractionPipelineCreate {
  id?: CogniteInternalId;
  /**
   * Time of the last successful run.
   */
  lastSuccess?: EpochTimestamp;
  /**
   * Time of the last failed run.
   */
  lastFailure?: EpochTimestamp;
  /**
   * Message of the last failed run.
   */
  lastMessage?: string;
  lastSeen?: EpochTimestamp;
  createdTime?: EpochTimestamp;
  lastUpdatedTime?: EpochTimestamp;
}

export interface ExtractionPipelinePatch {
  externalId?: SetField<CogniteExternalId>;
  name?: SinglePatchRequiredString;
  description?: SetField<string | null>;
  dataSetId?: SetField<CogniteInternalId>;
  schedule?: SetField<string | null>;
  rawTables?:
    | SetField<ExtractionPipelineRawTable[] | null>
    | {
        add?: ExtractionPipelineRawTable[];
        remove?: ExtractionPipelineRawTable[];
      };
  contacts?:
    | SetField<ExtractionPipelineContact[]>
    | {
        add?: ExtractionPipelineContact[];
        remove?: ExtractionPipelineContact[];
      };
  metadata?:
    | SetField<Metadata | null>
    | {
        /**
         * Values for existing keys are overwritten.
         */
        add?: Metadata | null;
        /**
         * Keys to remove.
         */
        remove?: string[] | null;
      };
  source?: SetField<string | null>;
  documentation?: SetField<string | null>;
  notificationConfig?: SetField<ExtractionPipelineNotificationConfiguration>;
}

export type ExtractionPipelineChange = IdEither & {
  update: ExtractionPipelinePatch;
};

export interface ExtractionPipelineFilter {
  /**
   * Case-sensitive prefix of the external ID.
   */
  externalIdPrefix?: string;
  name?: string;
  description?: string;
  /**
   * Between 1 and 100 data sets.
   */
  dataSetIds?: IdEither[];
  schedule?: string;
  contacts?: ExtractionPipelineContact[];
  rawTables?: ExtractionPipelineRawTable[];
  metadata?: Metadata;
  source?: string;
  documentation?: string;
  createdBy?: string;
  createdTime?: Range<EpochTimestamp>;
  lastUpdatedTime?: Range<EpochTimestamp>;
}

export interface ExtractionPipelineFilterQuery extends FilterQuery {
  filter?: ExtractionPipelineFilter;
}
