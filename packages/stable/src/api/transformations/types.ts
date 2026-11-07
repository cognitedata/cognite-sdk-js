// Copyright 2026 Cognite AS

import type {
  CogniteExternalId,
  CogniteInternalId,
  FilterQuery,
  IdEither,
} from '@cognite/sdk-core';
import type {
  ArrayPatchString,
  IgnoreUnknownIds,
  NullableSinglePatchLong,
  Range,
  SetField,
  SinglePatchRequiredString,
} from '../../types';
import type { EpochTimestamp } from '../../types.gen';
import type { SessionId } from '../sessions/types';

/**
 * Behavior when the data already exists.
 * - `upsert`: create or update
 * - `abort`: create, and fail if it already exists
 * - `update`: update, and fail if it does not exist
 * - `delete`: delete the matched rows
 */
export type TransformationConflictMode =
  | 'abort'
  | 'delete'
  | 'update'
  | 'upsert';

export type TransformationAssetCentricDestinationType =
  | 'assets'
  | 'events'
  | 'asset_hierarchy'
  | 'datapoints'
  | 'string_datapoints'
  | 'timeseries'
  | 'sequences'
  | 'files'
  | 'labels'
  | 'relationships'
  | 'data_sets';

export interface TransformationAssetCentricDestination {
  type: TransformationAssetCentricDestinationType;
}

/**
 * Options to control the automatic creation of related instances when writing to data models.
 * All options default to `true`. When an option is `false`, the transformation fails with
 * a 400 error if a referenced instance doesn't exist.
 */
export interface TransformationAutoCreateOptions {
  startNodes?: boolean;
  endNodes?: boolean;
  directRelations?: boolean;
}

export interface TransformationDataModelInfo {
  space: string;
  externalId: CogniteExternalId;
  version: string;
  /**
   * External ID of the type (view) in the data model.
   */
  destinationType: string;
  /**
   * Property identifier of the connection definition in `destinationType`.
   */
  destinationRelationshipFromType?: string;
}

export interface TransformationDataModelDestination {
  type: 'instances';
  dataModel: TransformationDataModelInfo;
  /**
   * The space where the instances will be created.
   */
  instanceSpace?: string;
  autoCreate?: TransformationAutoCreateOptions;
}

export interface TransformationViewInfo {
  space: string;
  externalId: CogniteExternalId;
  version: string;
}

export interface TransformationEdgeType {
  space: string;
  externalId: CogniteExternalId;
}

export interface TransformationViewDestination {
  type: 'nodes' | 'edges';
  view?: TransformationViewInfo;
  edgeType?: TransformationEdgeType;
  /**
   * The space where the nodes or edges will be created.
   */
  instanceSpace?: string;
  autoCreate?: TransformationAutoCreateOptions;
}

export interface TransformationRawDestination {
  type: 'raw';
  database: string;
  table: string;
}

export interface TransformationSequenceRowsDestination {
  type: 'sequence_rows';
  /**
   * External ID of the sequence.
   */
  externalId: CogniteExternalId;
}

export type TransformationDestination =
  | TransformationAssetCentricDestination
  | TransformationDataModelDestination
  | TransformationViewDestination
  | TransformationRawDestination
  | TransformationSequenceRowsDestination;

export type TransformationDestinationType = TransformationDestination['type'];

/**
 * Credentials for a CDF session. Get them by creating a session with `client.sessions.create`.
 */
export interface TransformationNonceCredentials {
  sessionId: SessionId;
  nonce: string;
  cdfProjectName: string;
  clientId?: string;
}

export interface TransformationSessionInfo {
  clientId?: string;
  sessionId?: SessionId;
  projectName?: string;
}

export interface TransformationBlockedInfo {
  reason: string;
  createdTime: EpochTimestamp;
}

export type TransformationJobStatus =
  | 'Completed'
  | 'Created'
  | 'Failed'
  | 'Running';

export interface TransformationJob {
  id: CogniteInternalId;
  uuid: string;
  transformationId: CogniteInternalId;
  transformationExternalId: CogniteExternalId;
  sourceProject: string;
  destinationProject: string;
  destination: TransformationDestination;
  conflictMode: TransformationConflictMode;
  query: string;
  ignoreNullFields: boolean;
  status: TransformationJobStatus;
  createdTime: EpochTimestamp;
  startedTime?: EpochTimestamp;
  finishedTime?: EpochTimestamp;
  lastSeenTime?: EpochTimestamp;
  /**
   * Why the job failed. Not set if the job did not fail.
   */
  error?: string;
}

export interface TransformationSchedule {
  id: CogniteInternalId;
  externalId: CogniteExternalId;
  createdTime: EpochTimestamp;
  lastUpdatedTime: EpochTimestamp;
  /**
   * Cron expression that describes when the transformation should run.
   */
  interval: string;
  isPaused: boolean;
}

export type TransformationScheduleCreate = IdEither & {
  /**
   * Cron expression that describes when the transformation should run.
   */
  interval: string;
  /**
   * If true, the transformation is not scheduled.
   */
  isPaused?: boolean;
};

export interface TransformationSchedulePatch {
  interval?: SetField<string>;
  isPaused?: SetField<boolean>;
}

export type TransformationScheduleChange = IdEither & {
  update: TransformationSchedulePatch;
};

export interface TransformationScheduleListQuery extends FilterQuery {
  /**
   * Whether to include schedules of public transformations.
   * @default true
   */
  includePublic?: boolean;
}

export interface Transformation {
  id: CogniteInternalId;
  externalId: CogniteExternalId;
  name: string;
  query: string;
  destination: TransformationDestination;
  conflictMode: TransformationConflictMode;
  /**
   * Whether the transformation is visible to everyone in the project, or only to the owner.
   */
  isPublic: boolean;
  /**
   * How NULL values are handled on updates. `true` ignores them, `false` sets the fields to null.
   */
  ignoreNullFields: boolean;
  blocked?: TransformationBlockedInfo;
  createdTime: EpochTimestamp;
  lastUpdatedTime: EpochTimestamp;
  owner: string;
  ownerIsCurrentUser: boolean;
  hasSourceOidcCredentials: boolean;
  hasDestinationOidcCredentials: boolean;
  sourceSession?: TransformationSessionInfo;
  destinationSession?: TransformationSessionInfo;
  lastFinishedJob?: TransformationJob;
  runningJob?: TransformationJob;
  schedule?: TransformationSchedule;
  dataSetId?: CogniteInternalId;
  tags?: string[];
}

export interface TransformationCreate {
  externalId: CogniteExternalId;
  name: string;
  /**
   * How NULL values are handled on updates. `true` ignores them, `false` sets the fields to null.
   */
  ignoreNullFields: boolean;
  query?: string;
  destination?: TransformationDestination;
  conflictMode?: TransformationConflictMode;
  isPublic?: boolean;
  sourceNonce?: TransformationNonceCredentials;
  destinationNonce?: TransformationNonceCredentials;
  dataSetId?: CogniteInternalId;
  /**
   * Between 1 and 5 tags, each 1 to 35 characters long.
   */
  tags?: string[];
}

export type TransformationNonceCredentialsPatch =
  | { set: TransformationNonceCredentials }
  | { setNull: true };

export interface TransformationPatch {
  name?: SinglePatchRequiredString;
  externalId?: SetField<CogniteExternalId>;
  query?: SetField<string>;
  destination?: SetField<TransformationDestination>;
  conflictMode?: SetField<TransformationConflictMode>;
  isPublic?: SetField<boolean>;
  ignoreNullFields?: SetField<boolean>;
  sourceNonce?: TransformationNonceCredentialsPatch;
  destinationNonce?: TransformationNonceCredentialsPatch;
  dataSetId?: NullableSinglePatchLong;
  tags?: ArrayPatchString;
}

export type TransformationChange = IdEither & { update: TransformationPatch };

export interface TransformationListQuery extends FilterQuery {
  /**
   * Whether to include public transformations.
   * @default true
   */
  includePublic?: boolean;
  /**
   * Whether to include details about the running and last finished jobs.
   * @default true
   */
  withJobDetails?: boolean;
}

export interface TransformationFilter {
  /**
   * Whether to include public transformations.
   * @default true
   */
  isPublic?: boolean;
  /**
   * Regex that the transformation name must match.
   */
  nameRegex?: string;
  /**
   * Regex that the transformation query must match.
   */
  queryRegex?: string;
  destinationType?: TransformationDestinationType;
  conflictMode?: TransformationConflictMode;
  /**
   * Only include transformations that are blocked.
   */
  hasBlockedError?: boolean;
  /**
   * Only include transformations with this source or destination project.
   */
  cdfProjectName?: string;
  createdTime?: Range<EpochTimestamp>;
  lastUpdatedTime?: Range<EpochTimestamp>;
  dataSetIds?: IdEither[];
  tags?: { containsAny: string[] };
}

export interface TransformationFilterQuery extends FilterQuery {
  filter: TransformationFilter;
}

export interface TransformationRetrieveParams extends IgnoreUnknownIds {
  /**
   * Whether to include details about the running and last finished jobs.
   * @default true
   */
  withJobDetails?: boolean;
}

export type TransformationRunRequest = IdEither & {
  /**
   * Session to run the transformation with. If not set, the transformation
   * runs with the credentials it is configured with.
   */
  nonce?: TransformationNonceCredentials;
};

/**
 * Spark type of a nested column, for example
 * `{ type: 'struct', fields: [...] }` or `{ type: 'array', elementType: 'string', containsNull: true }`.
 */
export interface TransformationSchemaComplexType {
  type: string;
  [key: string]: unknown;
}

/**
 * Column type in JSON format. Simple types are strings, such as `'string'` or `'long'`.
 */
export type TransformationSchemaColumnType =
  | string
  | TransformationSchemaComplexType;

export interface TransformationSchemaColumn {
  name: string;
  /**
   * Column type in SQL format, for example `STRING` or `ARRAY<STRING>`.
   */
  sqlType: string;
  type: TransformationSchemaColumnType;
  nullable: boolean;
}
