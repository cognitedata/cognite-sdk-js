// Copyright 2020 Cognite AS

import {
  CogniteExternalId,
  CogniteInternalId,
  FilterQuery,
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
