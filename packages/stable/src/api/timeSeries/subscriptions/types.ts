// Copyright 2026 Cognite AS

import type {
  CogniteExternalId,
  CogniteInstanceId,
  CogniteInternalId,
  Cursor,
} from '@cognite/sdk-core';
import type {
  IgnoreUnknownIds,
  NullableSinglePatchLong,
  NullableSinglePatchString,
} from '../../../types/common';
import type {
  DatapointsDeleteRange,
  DoubleDatapoint,
  StringDatapoint,
} from '../../dataPoints/types';
import type { TimeSeriesType } from '../types';

// =====================================================
// Subscription filter DSL
// =====================================================

export type SubscriptionFilterProperty = [string] | [string, string];

export type SubscriptionFilterScalar = string | number | boolean;

export interface SubscriptionEqualsFilter {
  equals: {
    property: SubscriptionFilterProperty;
    value: SubscriptionFilterScalar;
  };
}

export interface SubscriptionInFilter {
  in: {
    property: SubscriptionFilterProperty;
    values: SubscriptionFilterScalar[];
  };
}

export interface SubscriptionRangeFilter {
  range: {
    property: SubscriptionFilterProperty;
    gte?: string | number;
    gt?: string | number;
    lte?: string | number;
    lt?: string | number;
  };
}

export interface SubscriptionPrefixFilter {
  prefix: {
    property: SubscriptionFilterProperty;
    value: string;
  };
}

export interface SubscriptionExistsFilter {
  exists: {
    property: SubscriptionFilterProperty;
  };
}

export interface SubscriptionContainsAnyFilter {
  containsAny: {
    property: SubscriptionFilterProperty;
    values: SubscriptionFilterScalar[];
  };
}

export interface SubscriptionContainsAllFilter {
  containsAll: {
    property: SubscriptionFilterProperty;
    values: SubscriptionFilterScalar[];
  };
}

export type SubscriptionLeafFilter =
  | SubscriptionEqualsFilter
  | SubscriptionInFilter
  | SubscriptionRangeFilter
  | SubscriptionPrefixFilter
  | SubscriptionExistsFilter
  | SubscriptionContainsAnyFilter
  | SubscriptionContainsAllFilter;

export type SubscriptionBoolFilter =
  | { and: SubscriptionFilterLanguage[] }
  | { or: SubscriptionFilterLanguage[] }
  | { not: SubscriptionFilterLanguage };

export type SubscriptionFilterLanguage =
  | SubscriptionBoolFilter
  | SubscriptionLeafFilter;

// =====================================================
// Create / read / update / delete
// =====================================================

export interface DataPointSubscriptionCreateBase {
  externalId: CogniteExternalId;
  name?: string;
  description?: string;
  dataSetId?: CogniteInternalId;
  partitionCount: number;
}

export type DataPointSubscriptionCreate =
  | (DataPointSubscriptionCreateBase & {
      timeSeriesIds: CogniteExternalId[];
      instanceIds?: undefined;
      filter?: undefined;
    })
  | (DataPointSubscriptionCreateBase & {
      instanceIds: CogniteInstanceId[];
      timeSeriesIds?: undefined;
      filter?: undefined;
    })
  | (DataPointSubscriptionCreateBase & {
      filter: SubscriptionFilterLanguage;
      timeSeriesIds?: undefined;
      instanceIds?: undefined;
    });

export interface DataPointSubscription {
  externalId: CogniteExternalId;
  name?: string;
  description?: string;
  dataSetId?: CogniteInternalId;
  partitionCount: number;
  timeSeriesCount?: number;
  filter?: SubscriptionFilterLanguage;
  createdTime: Date;
  lastUpdatedTime: Date;
}

export interface DataPointSubscriptionMember {
  externalId?: CogniteExternalId;
  id?: CogniteInternalId;
  instanceId?: CogniteInstanceId;
}

export interface DataPointSubscriptionListQuery extends Cursor {
  limit?: number;
}

export interface DataPointSubscriptionListResponse {
  items: DataPointSubscription[];
  nextCursor?: string;
}

export interface DataPointSubscriptionMembersListQuery extends Cursor {
  externalId: CogniteExternalId;
  limit?: number;
}

export interface DataPointSubscriptionMembersListResponse {
  items: DataPointSubscriptionMember[];
  nextCursor?: string;
}

export type DataPointSubscriptionTimeSeriesIdsUpdate =
  | { add: CogniteExternalId[]; remove: CogniteExternalId[] }
  | { set: CogniteExternalId[] };

export type DataPointSubscriptionInstanceIdsUpdate =
  | { add: CogniteInstanceId[]; remove: CogniteInstanceId[] }
  | { set: CogniteInstanceId[] };

export interface DataPointSubscriptionUpdateBody {
  timeSeriesIds?: DataPointSubscriptionTimeSeriesIdsUpdate;
  instanceIds?: DataPointSubscriptionInstanceIdsUpdate;
  name?: NullableSinglePatchString;
  description?: NullableSinglePatchString;
  dataSetId?: NullableSinglePatchLong;
  filter?: { set: SubscriptionFilterLanguage };
}

export interface DataPointSubscriptionUpdate {
  externalId: CogniteExternalId;
  update: DataPointSubscriptionUpdateBody;
}

export interface DataPointSubscriptionByIdsQuery extends IgnoreUnknownIds {
  items: { externalId: CogniteExternalId }[];
}

export interface DataPointSubscriptionsDeleteQuery extends IgnoreUnknownIds {
  items: { externalId: CogniteExternalId }[];
}

// =====================================================
// List subscription data
// =====================================================

export interface DataPointSubscriptionPartitionCursor {
  index: number;
  cursor?: string;
}

export interface DataPointSubscriptionListDataQuery {
  externalId?: CogniteExternalId;
  partitions: DataPointSubscriptionPartitionCursor[];
  limit?: number;
  initializeCursors?: string;
  pollTimeoutSeconds?: number;
  includeStatus?: boolean;
  ignoreBadDataPoints?: boolean;
  treatUncertainAsBad?: boolean;
}

export interface GetTimeSeriesForSubscription {
  id: CogniteInternalId;
  externalId?: CogniteExternalId;
  instanceId?: CogniteInstanceId;
  isString: boolean;
  type: TimeSeriesType;
}

export type SubscriptionDataUpsert = DoubleDatapoint | StringDatapoint;

export interface DataPointSubscriptionDataUpdate {
  timeSeries?: GetTimeSeriesForSubscription;
  upserts?: SubscriptionDataUpsert[];
  deletes?: DatapointsDeleteRange[];
}

export interface DataPointSubscriptionListDataResponse {
  updates: DataPointSubscriptionDataUpdate[];
  subscriptionChanges?: {
    added?: GetTimeSeriesForSubscription[];
    removed?: GetTimeSeriesForSubscription[];
  };
  partitions: { index: number; nextCursor: string }[];
  hasNext: boolean;
}
