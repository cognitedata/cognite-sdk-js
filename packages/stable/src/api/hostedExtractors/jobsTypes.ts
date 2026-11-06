// Copyright 2026 Cognite AS

import type { CogniteExternalId, FilterQuery } from '@cognite/sdk-core';
import type { SetField, SinglePatchString } from '../../types';
import type { EpochTimestamp } from '../../types.gen';
import type {
  HostedExtractorMetadata,
  HostedExtractorMetadataPatch,
} from './commonTypes';

// Formats

/**
 * The encoding to convert from.
 * - `utf8`: UTF-8, the default.
 * - `utf16`: UTF-16 big endian.
 * - `utf16le`: UTF-16 little endian.
 * - `latin1`: Latin 1, specifically Windows CP 1252.
 */
export type HostedExtractorJobEncoding =
  | 'utf8'
  | 'utf16'
  | 'utf16le'
  | 'latin1';

/**
 * The compression of incoming messages. Messages are decompressed before
 * they are transformed. REST handles this automatically, but MQTT, Kafka and
 * Event Hub do not.
 */
export type HostedExtractorJobCompression = 'gzip';

/**
 * Generates a prefix for the IDs of resources created by the format. If both
 * `prefix` and `fromTopic` are set, IDs have the form `[prefix][topic][id]`.
 */
export interface HostedExtractorJobPrefixConfig {
  /**
   * Generate the prefix from the topic of the received message.
   */
  fromTopic?: boolean;
  /**
   * A fixed prefix for the generated IDs.
   */
  prefix?: string;
}

export interface HostedExtractorJobDataModels {
  /**
   * The data modeling space where time series are created.
   */
  space: string;
}

interface HostedExtractorJobFormatCommon {
  encoding?: HostedExtractorJobEncoding;
  compression?: HostedExtractorJobCompression;
}

interface HostedExtractorJobBuiltInFormatCommon
  extends HostedExtractorJobFormatCommon {
  prefix?: HostedExtractorJobPrefixConfig;
  dataModels?: HostedExtractorJobDataModels;
}

/**
 * Transforms data in the Rockwell FactoryTalk format into CDF time series.
 */
export interface HostedExtractorJobRockwellFormat
  extends HostedExtractorJobBuiltInFormatCommon {
  type: 'rockwell';
}

/**
 * Converts the Cognite format to CDF data points.
 */
export interface HostedExtractorJobCogniteFormat
  extends HostedExtractorJobBuiltInFormatCommon {
  type: 'cognite';
}

/**
 * Converts plain values such as `some string` or `123.456` to CDF data
 * points, with the current time as timestamp. The prefix config sets the
 * time series external ID; without it, the topic name is used.
 */
export interface HostedExtractorJobValueFormat
  extends HostedExtractorJobBuiltInFormatCommon {
  type: 'value';
}

/**
 * Converts the Sparkplug B format to CDF data points.
 */
export interface HostedExtractorJobSparkplugFormat
  extends HostedExtractorJobBuiltInFormatCommon {
  type: 'sparkplug';
}

/**
 * Formats the source data with a custom mapping.
 */
export interface HostedExtractorJobCustomFormatCreate
  extends HostedExtractorJobFormatCommon {
  type: 'custom';
  /**
   * External ID of the mapping this format uses.
   */
  mappingId: CogniteExternalId;
}

export interface HostedExtractorJobCustomFormat
  extends HostedExtractorJobCustomFormatCreate {
  /**
   * The transformation expression of the mapping given by `mappingId`.
   */
  expression: string;
}

/**
 * The format of the messages from the source, used to convert them to data
 * that can be written to CDF.
 */
export type HostedExtractorJobFormat =
  | HostedExtractorJobRockwellFormat
  | HostedExtractorJobCogniteFormat
  | HostedExtractorJobCustomFormat
  | HostedExtractorJobValueFormat
  | HostedExtractorJobSparkplugFormat;

export type HostedExtractorJobFormatCreate =
  | HostedExtractorJobRockwellFormat
  | HostedExtractorJobCogniteFormat
  | HostedExtractorJobCustomFormatCreate
  | HostedExtractorJobValueFormat
  | HostedExtractorJobSparkplugFormat;

export type HostedExtractorJobFormatType = HostedExtractorJobFormat['type'];

// Config

export interface HostedExtractorJobMqttConfig {
  topicFilter: string;
}

export interface HostedExtractorJobKafkaConfig {
  topic: string;
  /**
   * Number of partitions on the topic. Between 1 and 10.
   * @default 1
   */
  partitions?: number;
}

export type HostedExtractorJobRestInterval =
  | '5m'
  | '15m'
  | '1h'
  | '6h'
  | '12h'
  | '1d';

export interface HostedExtractorJobRestQueryParamConfig {
  type: 'queryParam';
  /**
   * Query parameter to insert the generated value into.
   */
  key: string;
  /**
   * Expression whose result is used as the query parameter value.
   */
  value: string;
}

export interface HostedExtractorJobRestHeaderValueConfig {
  type: 'headerValue';
  /**
   * Header to insert the generated value into.
   */
  key: string;
  /**
   * Expression whose result is used as the header value.
   */
  value: string;
}

export interface HostedExtractorJobRestBodyConfig {
  type: 'body';
  /**
   * Expression yielding the next request body. Only allowed when `method`
   * is `post`.
   */
  value: string;
}

export interface HostedExtractorJobRestNextUrlConfig {
  type: 'nextUrl';
  /**
   * Expression yielding the next URL to call.
   */
  value: string;
}

export type HostedExtractorJobRestIncrementalLoad =
  | HostedExtractorJobRestQueryParamConfig
  | HostedExtractorJobRestHeaderValueConfig
  | HostedExtractorJobRestBodyConfig;

export type HostedExtractorJobRestPagination =
  | HostedExtractorJobRestQueryParamConfig
  | HostedExtractorJobRestHeaderValueConfig
  | HostedExtractorJobRestNextUrlConfig
  | HostedExtractorJobRestBodyConfig;

export interface HostedExtractorJobRestConfig {
  interval: HostedExtractorJobRestInterval;
  /**
   * Path of the resource on the server, without the query.
   */
  path: string;
  /**
   * @default 'get'
   */
  method?: 'get' | 'post';
  /**
   * Initial JSON body of the request. Only used when `method` is `post`.
   * At most 10000 bytes.
   */
  body?: unknown;
  /**
   * At most 32 pairs, 255 characters per key and 2048 per value.
   */
  query?: Record<string, string>;
  /**
   * At most 32 pairs, 255 characters per key and 2048 per value.
   */
  headers?: Record<string, string>;
  incrementalLoad?: HostedExtractorJobRestIncrementalLoad;
  pagination?: HostedExtractorJobRestPagination;
}

/**
 * Source specific job configuration. Which one applies depends on the type
 * of the source, and it is required for some sources.
 */
export type HostedExtractorJobConfig =
  | HostedExtractorJobMqttConfig
  | HostedExtractorJobKafkaConfig
  | HostedExtractorJobRestConfig;

// Jobs

/**
 * The status the job should have. Set it to start or stop the job.
 */
export type HostedExtractorJobTargetStatus = 'running' | 'paused';

export type HostedExtractorJobStatus =
  | 'startup_error'
  | 'paused'
  | 'shutting_down'
  | 'connected'
  | 'running'
  | 'waiting'
  | 'connection_error'
  | 'cdf_write_error'
  | 'transform_error';

export interface HostedExtractorJob {
  externalId: CogniteExternalId;
  /**
   * External ID of the destination the job writes to.
   */
  destinationId: CogniteExternalId;
  /**
   * External ID of the source the job reads from.
   */
  sourceId: CogniteExternalId;
  format: HostedExtractorJobFormat;
  targetStatus: HostedExtractorJobTargetStatus;
  status: HostedExtractorJobStatus;
  config: HostedExtractorJobConfig;
  /**
   * Whether the dead letter queue is enabled.
   * @default false
   */
  dlqEnabled?: boolean;
  createdTime: EpochTimestamp;
  lastUpdatedTime: EpochTimestamp;
  name?: string;
  description?: string;
  metadata?: HostedExtractorMetadata;
}

export interface HostedExtractorJobCreate {
  externalId: CogniteExternalId;
  /**
   * External ID of the destination the job writes to.
   */
  destinationId: CogniteExternalId;
  /**
   * External ID of the source the job reads from.
   */
  sourceId: CogniteExternalId;
  format: HostedExtractorJobFormatCreate;
  config?: HostedExtractorJobConfig;
  /**
   * At most 50 characters.
   */
  name?: string;
  /**
   * At most 500 characters.
   */
  description?: string;
  metadata?: HostedExtractorMetadata;
}

export interface HostedExtractorJobPatch {
  destinationId?: SetField<CogniteExternalId>;
  format?: SetField<HostedExtractorJobFormatCreate>;
  sourceId?: SetField<CogniteExternalId>;
  targetStatus?: SetField<HostedExtractorJobTargetStatus>;
  config?: { set?: HostedExtractorJobConfig };
  /**
   * Enable or disable the dead letter queue, which writes the messages the
   * job fails to transform to CDF RAW. Enabling it requires the destination
   * credentials to have write access to RAW.
   */
  dlqEnabled?: SetField<boolean>;
  name?: SinglePatchString;
  description?: SinglePatchString;
  metadata?: HostedExtractorMetadataPatch;
}

export interface HostedExtractorJobChange {
  externalId: CogniteExternalId;
  update: HostedExtractorJobPatch;
}

export interface HostedExtractorJobListQuery extends FilterQuery {
  /**
   * Only return jobs that read from the source with this external ID.
   */
  source?: CogniteExternalId;
  /**
   * Only return jobs that write to the destination with this external ID.
   */
  destination?: CogniteExternalId;
  /**
   * Only return jobs that use the mapping with this external ID.
   */
  mapping?: CogniteExternalId;
}

// Logs and metrics

interface HostedExtractorJobMonitoringQuery extends FilterQuery {
  /**
   * Only return entries of the job with this external ID.
   */
  job?: CogniteExternalId;
  /**
   * Only return entries of jobs that read from the source with this
   * external ID.
   */
  source?: CogniteExternalId;
  /**
   * Only return entries of jobs that write to the destination with this
   * external ID.
   */
  destination?: CogniteExternalId;
}

export type HostedExtractorJobLogsListQuery = HostedExtractorJobMonitoringQuery;

export type HostedExtractorJobMetricsListQuery =
  HostedExtractorJobMonitoringQuery;

/**
 * - `paused`: the job was stopped manually.
 * - `startup_error`: the job failed to start, and its configuration must change.
 * - `connection_error`: the job failed to connect to the source.
 * - `connected`: the job connected to the source, but has not received data.
 * - `transform_error`: the job received data, but failed to transform it.
 * - `cdf_write_error`: writing the data to CDF failed.
 * - `ok`: data was written to CDF.
 */
export type HostedExtractorJobLogType =
  | 'paused'
  | 'startup_error'
  | 'connection_error'
  | 'connected'
  | 'transform_error'
  | 'cdf_write_error'
  | 'ok';

export interface HostedExtractorJobLog {
  jobExternalId: CogniteExternalId;
  type: HostedExtractorJobLogType;
  /**
   * Not all log entries have a message.
   */
  message?: string;
  createdTime: EpochTimestamp;
}

/**
 * Metrics for one job, from the start of the UTC hour of `timestamp` until
 * `timestamp`.
 */
export interface HostedExtractorJobMetric {
  jobExternalId: CogniteExternalId;
  timestamp: EpochTimestamp;
  /**
   * Messages received from the source.
   */
  sourceMessages: number;
  /**
   * Bytes received from the source.
   */
  sourceBytes: number;
  /**
   * Destination resources transformed and passed to CDF.
   */
  cdfInputValues: number;
  /**
   * Requests to CDF with data produced by the job.
   */
  cdfRequests: number;
  /**
   * Source messages that failed to transform.
   */
  transformFailures: number;
  /**
   * Times the destination received transformed data, but failed to produce
   * a valid request to CDF.
   */
  cdfWriteFailures: number;
  /**
   * Values the destination skipped, for example because of a data type
   * mismatch or invalid content.
   */
  cdfSkippedValues: number;
  /**
   * Values the destination failed to upload to CDF.
   */
  cdfFailedValues: number;
  /**
   * Values the destination uploaded to CDF.
   */
  cdfUploadedValues: number;
}

// Dead letter queue

export interface HostedExtractorJobDlqMessagesListQuery extends FilterQuery {
  /**
   * External ID of the job.
   */
  job: CogniteExternalId;
  /**
   * Only return messages last updated at or after this time. Must not be
   * greater than `maxLastUpdatedTime`.
   */
  minLastUpdatedTime?: EpochTimestamp;
  /**
   * Only return messages last updated at or before this time.
   */
  maxLastUpdatedTime?: EpochTimestamp;
}

/**
 * The columns of a dead letter queue row, as stored in CDF RAW. They are not
 * validated, so other columns may be present.
 */
export interface HostedExtractorJobDlqMessageColumns {
  [column: string]: unknown;
  /**
   * RFC 3339 time the failure was recorded.
   */
  timestamp: string;
  /**
   * Internal ID of the job.
   */
  jobId: number;
  mappingExternalId?: CogniteExternalId | null;
  /**
   * Base 64 encoded raw message payload.
   */
  rawPayload?: string | null;
  /**
   * The payload decoded as UTF-8, when the raw bytes are valid UTF-8.
   */
  decodedPayload?: string | null;
  error: string;
  /**
   * A snake_case category of the failure, such as `transform_expression` or
   * `missing_field`. New categories may be added.
   */
  errorCategory: string;
  /**
   * Source specific context, such as topic, offset or partition.
   */
  metadata?: string | null;
}

export interface HostedExtractorJobDlqMessage {
  /**
   * The row key. Empty if the row has no key.
   */
  key: string;
  columns: HostedExtractorJobDlqMessageColumns;
}
