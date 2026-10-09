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

/** @deprecated Asset-centric API type, will move to the legacy namespace in the next major release. */
export type SubscriptionFilterProperty = [string] | [string, string];

/** @deprecated Asset-centric API type, will move to the legacy namespace in the next major release. */
export type SubscriptionFilterScalar = string | number | boolean;

/** @deprecated Asset-centric API type, will move to the legacy namespace in the next major release. */
export interface SubscriptionEqualsFilter {
  equals: {
    property: SubscriptionFilterProperty;
    value: SubscriptionFilterScalar;
  };
}

/** @deprecated Asset-centric API type, will move to the legacy namespace in the next major release. */
export interface SubscriptionInFilter {
  in: {
    property: SubscriptionFilterProperty;
    values: SubscriptionFilterScalar[];
  };
}

/** @deprecated Asset-centric API type, will move to the legacy namespace in the next major release. */
export interface SubscriptionRangeFilter {
  range: {
    property: SubscriptionFilterProperty;
    gte?: string | number;
    gt?: string | number;
    lte?: string | number;
    lt?: string | number;
  };
}

/** @deprecated Asset-centric API type, will move to the legacy namespace in the next major release. */
export interface SubscriptionPrefixFilter {
  prefix: {
    property: SubscriptionFilterProperty;
    value: string;
  };
}

/** @deprecated Asset-centric API type, will move to the legacy namespace in the next major release. */
export interface SubscriptionExistsFilter {
  exists: {
    property: SubscriptionFilterProperty;
  };
}

/** @deprecated Asset-centric API type, will move to the legacy namespace in the next major release. */
export interface SubscriptionContainsAnyFilter {
  containsAny: {
    property: SubscriptionFilterProperty;
    values: SubscriptionFilterScalar[];
  };
}

/** @deprecated Asset-centric API type, will move to the legacy namespace in the next major release. */
export interface SubscriptionContainsAllFilter {
  containsAll: {
    property: SubscriptionFilterProperty;
    values: SubscriptionFilterScalar[];
  };
}

/** @deprecated Asset-centric API type, will move to the legacy namespace in the next major release. */
export type SubscriptionLeafFilter =
  | SubscriptionEqualsFilter
  | SubscriptionInFilter
  | SubscriptionRangeFilter
  | SubscriptionPrefixFilter
  | SubscriptionExistsFilter
  | SubscriptionContainsAnyFilter
  | SubscriptionContainsAllFilter;

/** @deprecated Asset-centric API type, will move to the legacy namespace in the next major release. */
export type SubscriptionBoolFilter =
  | { and: SubscriptionFilterLanguage[] }
  | { or: SubscriptionFilterLanguage[] }
  | { not: SubscriptionFilterLanguage };

/** @deprecated Asset-centric API type, will move to the legacy namespace in the next major release. */
export type SubscriptionFilterLanguage =
  | SubscriptionBoolFilter
  | SubscriptionLeafFilter;

// =====================================================
// Create / read / update / delete
// =====================================================

/** @deprecated Asset-centric API type, will move to the legacy namespace in the next major release. */
export interface DataPointSubscriptionCreateBase {
  externalId: CogniteExternalId;
  name?: string;
  description?: string;
  dataSetId?: CogniteInternalId;
  partitionCount: number;
}

/** @deprecated Asset-centric API type, will move to the legacy namespace in the next major release. */
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

/** @deprecated Asset-centric API type, will move to the legacy namespace in the next major release. */
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

/** @deprecated Asset-centric API type, will move to the legacy namespace in the next major release. */
export interface DataPointSubscriptionMember {
  externalId?: CogniteExternalId;
  id?: CogniteInternalId;
  instanceId?: CogniteInstanceId;
}

/** @deprecated Asset-centric API type, will move to the legacy namespace in the next major release. */
export interface DataPointSubscriptionListQuery extends Cursor {
  limit?: number;
}

/** @deprecated Asset-centric API type, will move to the legacy namespace in the next major release. */
export interface DataPointSubscriptionListResponse {
  items: DataPointSubscription[];
  nextCursor?: string;
}

/** @deprecated Asset-centric API type, will move to the legacy namespace in the next major release. */
export interface DataPointSubscriptionMembersListQuery extends Cursor {
  externalId: CogniteExternalId;
  limit?: number;
}

/** @deprecated Asset-centric API type, will move to the legacy namespace in the next major release. */
export interface DataPointSubscriptionMembersListResponse {
  items: DataPointSubscriptionMember[];
  nextCursor?: string;
}

/** @deprecated Asset-centric API type, will move to the legacy namespace in the next major release. */
export type DataPointSubscriptionTimeSeriesIdsUpdate =
  | { add: CogniteExternalId[]; remove: CogniteExternalId[] }
  | { set: CogniteExternalId[] };

/** @deprecated Asset-centric API type, will move to the legacy namespace in the next major release. */
export type DataPointSubscriptionInstanceIdsUpdate =
  | { add: CogniteInstanceId[]; remove: CogniteInstanceId[] }
  | { set: CogniteInstanceId[] };

/** @deprecated Asset-centric API type, will move to the legacy namespace in the next major release. */
export interface DataPointSubscriptionUpdateBody {
  timeSeriesIds?: DataPointSubscriptionTimeSeriesIdsUpdate;
  instanceIds?: DataPointSubscriptionInstanceIdsUpdate;
  name?: NullableSinglePatchString;
  description?: NullableSinglePatchString;
  dataSetId?: NullableSinglePatchLong;
  filter?: { set: SubscriptionFilterLanguage };
}

/** @deprecated Asset-centric API type, will move to the legacy namespace in the next major release. */
export interface DataPointSubscriptionUpdate {
  externalId: CogniteExternalId;
  update: DataPointSubscriptionUpdateBody;
}

/** @deprecated Asset-centric API type, will move to the legacy namespace in the next major release. */
export interface DataPointSubscriptionByIdsQuery extends IgnoreUnknownIds {
  items: { externalId: CogniteExternalId }[];
}

/** @deprecated Asset-centric API type, will move to the legacy namespace in the next major release. */
export interface DataPointSubscriptionsDeleteQuery extends IgnoreUnknownIds {
  items: { externalId: CogniteExternalId }[];
}

// =====================================================
// List subscription data
// =====================================================

/** @deprecated Asset-centric API type, will move to the legacy namespace in the next major release. */
export interface DataPointSubscriptionPartitionCursor {
  index: number;
  cursor?: string;
}

/** @deprecated Asset-centric API type, will move to the legacy namespace in the next major release. */
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

/** @deprecated Asset-centric API type, will move to the legacy namespace in the next major release. */
export interface GetTimeSeriesForSubscription {
  id: CogniteInternalId;
  externalId?: CogniteExternalId;
  instanceId?: CogniteInstanceId;
  isString: boolean;
  type: TimeSeriesType;
}

/** @deprecated Asset-centric API type, will move to the legacy namespace in the next major release. */
export type SubscriptionDataUpsert = DoubleDatapoint | StringDatapoint;

/** @deprecated Asset-centric API type, will move to the legacy namespace in the next major release. */
export interface DataPointSubscriptionDataUpdate {
  timeSeries?: GetTimeSeriesForSubscription;
  upserts?: SubscriptionDataUpsert[];
  deletes?: DatapointsDeleteRange[];
}

/** @deprecated Asset-centric API type, will move to the legacy namespace in the next major release. */
export interface DataPointSubscriptionListDataResponse {
  updates: DataPointSubscriptionDataUpdate[];
  subscriptionChanges?: {
    added?: GetTimeSeriesForSubscription[];
    removed?: GetTimeSeriesForSubscription[];
  };
  partitions: { index: number; nextCursor: string }[];
  hasNext: boolean;
}
