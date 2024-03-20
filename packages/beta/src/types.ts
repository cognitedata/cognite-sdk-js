// Copyright 2020 Cognite AS

import {
  Aggregate as AggregateStable,
  DatapointAggregate as DatapointAggregateStable,
  DatapointsMultiQuery as DataPointsMultiQueryStable,
  DatapointsQueryProperties as DatapointsQueryPropertiesStable,
  DoubleDatapoint as DoubleDatapointStable,
  DoubleDatapoints as DoubleDatapointsStable,
  Metadata,
  MetadataPatch,
  SinglePatchRequired,
  SinglePatchRequiredString,
  SinglePatchString,
  StringDatapoint as StringDatapointStable,
  StringDatapoints as StringDatapointsStable,
  Timestamp,
} from '@cognite/sdk';
import {
  CogniteExternalId,
  CogniteInternalId,
  ExternalId,
  FilterQuery,
  InternalId,
} from '@cognite/sdk-core';

export * from '@cognite/sdk';

// This file is here mostly to allow apis to import { ... } from '../../types';
// Overriding types should probably be done in their respective API endpoint files, where possible

export interface IntIn {
  in: number[];
}

export interface IntEquals {
  equals: number;
}

export interface StringIn {
  in: string[];
}

export interface StringEquals {
  equals: string;
}

export interface EpochTimestampRange {
  max: number;
  min: number;
}

export interface ContainsAllIds {
  containsAll: CogniteInternalId[];
}

export interface ContainsAnyIds {
  containsAny: CogniteInternalId[];
}

export type MonitoringTaskModelExternalId = 'threshold' | 'double_threshold';

export const MonitoringTaskModelExternalId = {
  THRESHOLD: 'threshold' as const,
  DOUBLE_THRESHOLD: 'double_threshold' as const,
};

export interface MonitoringTaskThresholdModelCreateBase {
  externalId: MonitoringTaskModelExternalId;
}

export interface MonitoringTaskThresholdModelCreate
  extends MonitoringTaskThresholdModelCreateBase {
  externalId: 'threshold';
  timeseriesExternalId?: CogniteExternalId;
  timeseriesId?: CogniteInternalId;
  threshold: number;
  granularity?: string;
}

export interface MonitoringTaskDoubleThresholdModelCreate
  extends MonitoringTaskThresholdModelCreateBase {
  externalId: 'double_threshold';
  timeseriesExternalId?: CogniteExternalId;
  timeseriesId?: CogniteInternalId;
  lowerThreshold?: number;
  upperThreshold?: number;
  granularity?: string;
}

export interface MonitoringTaskThresholdModel {
  externalId: 'threshold';
  timeseriesId: CogniteInternalId;
  granularity?: string;
  threshold: number;
}

export interface MonitoringTaskDoubleThresholdModel {
  externalId: 'double_threshold';
  timeseriesId: CogniteInternalId;
  timeseriesExternalId?: CogniteExternalId;
  granularity?: string;
  lowerThreshold?: number;
  upperThreshold?: number;
}

export interface MonitoringTaskCreate {
  externalId: CogniteExternalId;
  name: string;
  channelId: CogniteInternalId;
  interval?: number;
  overlap?: number;
  model:
    | MonitoringTaskThresholdModelCreate
    | MonitoringTaskDoubleThresholdModelCreate;
  nonce: string;
  source?: string;
  sourceId?: string;
  alertContext?: {
    unsubscribeUrl: string;
    investigateUrl?: string;
    editUrl?: string;
  };
}

export interface MonitoringTask {
  id: CogniteInternalId;
  externalId?: CogniteExternalId;
  name: string;
  channelId: CogniteInternalId;
  interval: number;
  overlap: number;
  model: MonitoringTaskThresholdModel | MonitoringTaskDoubleThresholdModel;
  source?: string;
  sourceId?: string;
}

export interface MonitoringTaskModelFilter {
  timeseriesId: CogniteInternalId;
}

export interface MonitoringTaskFilter {
  externalIds?: CogniteExternalId[];
  ids?: CogniteInternalId[];
  channelIds?: CogniteInternalId[];
  model?: MonitoringTaskModelFilter;
}

export interface MonitoringTaskFilterQuery extends FilterQuery {
  filter?: MonitoringTaskFilter;
}

export interface AlertFilter {
  channelIds?: CogniteInternalId[];
  channelExternalIds?: CogniteExternalId[];
}

export interface AlertFilterQuery extends FilterQuery {
  filter?: AlertFilter;
}

export interface AlertDeduplicationRuleCreate {
  mergeInterval?: string;
  activationInterval?: string;
}

export interface AlertRulesCreate {
  deduplication: AlertDeduplicationRuleCreate;
}

export interface AlertDeduplicationRule {
  mergeInterval?: string;
  activationInterval?: string;
}

export interface AlertRules {
  deduplication: AlertDeduplicationRule;
}

export interface AlertCreate {
  externalId?: CogniteExternalId;
  timestamp?: Timestamp;
  channelId?: CogniteInternalId;
  channelExternalId?: CogniteExternalId;
  source: string;
  value?: string;
  level?: 'DEBUG' | 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
  metadata?: Metadata;
}

export interface Alert {
  id: CogniteInternalId;
  externalId?: CogniteExternalId;
  timestamp: Timestamp;
  channelId: CogniteInternalId;
  channelExternalId?: CogniteExternalId;
  source: string;
  value?: string;
  level?: 'DEBUG' | 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
  metadata?: Metadata;
  acknowledged: boolean;
  closed: boolean;
}

export interface ChannelCreate {
  externalId?: CogniteExternalId;
  parentExternalId?: CogniteExternalId;
  parentId?: CogniteInternalId;
  name: string;
  description?: string;
  metadata?: Metadata;
  alertRules?: AlertRulesCreate;
}

export interface Channel {
  id: CogniteInternalId;
  externalId?: CogniteExternalId;
  parentExternalId?: CogniteExternalId;
  parentId?: CogniteInternalId;
  name: string;
  description?: string;
  metadata?: Metadata;
  alertRules?: AlertRules;
}

export interface ChannelFilter {
  ids?: CogniteInternalId[];
  externalIds?: CogniteExternalId[];
  parentIds?: CogniteInternalId[];
  metadata?: Metadata;
}

export interface ChannelFilterQuery extends FilterQuery {
  filter?: ChannelFilter;
}

export interface ChannelPatch {
  update: {
    externalId?: SinglePatchString;
    name?: SinglePatchRequiredString;
    description?: SinglePatchString;
    parentId?: SinglePatchRequired<number>;
    metadata?: MetadataPatch;
  };
}

export interface ChannelChangeById extends ChannelPatch, InternalId {}

export interface ChannelChangeByExternalId extends ChannelPatch, ExternalId {}

export type ChannelChange = ChannelChangeById | ChannelChangeByExternalId;

export interface SubscriberCreate {
  externalId?: CogniteExternalId;
  metadata?: Metadata;
  email: string;
}

export interface SubscriberFilter {
  externalIds?: CogniteExternalId[];
  ids?: CogniteInternalId[];
  metadata?: Metadata;
  email?: string;
}

export interface SubscriberFilterQuery extends FilterQuery {
  filter?: SubscriberFilter;
}

export interface Subscriber {
  id: CogniteInternalId;
  externalId?: CogniteExternalId;
  metadata?: Metadata;
  email: string;
}

export interface SubscriberCreate {
  externalId?: CogniteExternalId;
  metadata?: Metadata;
  email: string;
}

export interface SubscriptionCreate {
  externalId?: CogniteExternalId;
  channelId?: CogniteInternalId;
  channelExternalId?: CogniteExternalId;
  subscriberId?: CogniteInternalId;
  subscriberExternalId?: CogniteExternalId;
  metadata?: Metadata;
}

export interface SubscriptionFilter {
  externalIds?: CogniteExternalId[];
  channelIds?: CogniteInternalId[];
  channelExternalIds?: CogniteExternalId[];
  subscriberIds?: CogniteInternalId[];
  subscriberExternalIds?: CogniteExternalId[];
  metadata?: Metadata;
}

export interface SubscriptionFilterQuery extends FilterQuery {
  filter?: SubscriptionFilter;
}

export interface SubscriptionDelete {
  externalId?: CogniteExternalId;
  channelExternalId?: CogniteExternalId;
  channelId?: CogniteInternalId;
  subscriberId?: CogniteInternalId;
  subscriberExternalId?: CogniteExternalId;
}

export interface Subscription {
  externalId?: CogniteExternalId;
  channelId: CogniteInternalId;
  channelExternalId?: CogniteExternalId;
  subscriberId: CogniteInternalId;
  subscriberExternalId?: CogniteExternalId;
  metadata?: Metadata;
}

export interface DatapointsMultiQuery
  extends Omit<DataPointsMultiQueryStable, 'items'> {
  items: DatapointsQuery[];
}

export type DatapointsQuery = DatapointsQueryId | DatapointsQueryExternalId;

export interface DatapointsQueryExternalId
  extends DatapointsQueryProperties,
    ExternalId {}

export interface DatapointsQueryId
  extends DatapointsQueryProperties,
    InternalId {}

export type Aggregate = AggregateStable | 'countUncertain' | 'countBad';
export interface DatapointsQueryProperties
  extends Omit<DatapointsQueryPropertiesStable, 'aggregates'> {
  /**
   * The aggregates to be returned. This value overrides top-level default aggregates list when set. Specify all aggregates to be retrieved here. Specify empty array if this sub-query needs to return datapoints without aggregation.
   */
  aggregates?: Aggregate[];
  /**
   * denotes that the status of the data point should be included in the response.
   */
  includeStatus?: boolean;
  /**
   * returns data points marked with the uncertain status code.
   * The default behavior of the API is to treat them the same as bad data points and don't returned them.
   */
  treatUncertainAsBad?: boolean;
  /**
   * denotes that the API should return bad data points.
   * Because the API treats uncertain data points as bad by default,
   * this parameter includes both uncertain and bad data points.
   */
  ignoreBadDatapoints?: boolean;
}

export interface DatapointStatus {
  code: number;
  symbol: string;
}

export interface DatapointAggregate extends DatapointAggregateStable {
  countUncertain?: number;
  countBad?: number;
}

export type Datapoints = StringDatapoints | DoubleDatapoints;

export interface DoubleDatapoints
  extends Omit<DoubleDatapointsStable, 'datapoints'> {
  datapoints: DoubleDatapoint[];
}

export interface StringDatapoints
  extends Omit<StringDatapointsStable, 'datapoints'> {
  datapoints: StringDatapoint[];
}

export interface DoubleDatapoint extends DoubleDatapointStable {
  status?: DatapointStatus;
}

export interface StringDatapoint extends StringDatapointStable {
  status?: DatapointStatus;
}
