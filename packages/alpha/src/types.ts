// Copyright 2020 Cognite AS

import { Metadata, MetadataPatch, SinglePatchRequiredString, SinglePatchString, Timestamp } from '@cognite/sdk';
import { CogniteExternalId, CogniteInternalId, ExternalId, FilterQuery, InternalId } from '@cognite/sdk-core';

export * from '@cognite/sdk';

export interface AlertFilter extends FilterQuery {
    channelId?: number;
    channelExternalId?: string;
}

export interface AlertCreate {
    externalId?: CogniteExternalId;
    timestamp?: Timestamp;
    channelId?: CogniteInternalId
    channelExternalId?: CogniteExternalId
    source: string
    value?: string
    level?: "DEBUG" | "INFO" | "WARNING" | "ERROR" | "CRITICAL"
    metadata?: Metadata
}

export interface Alert {
    id: CogniteInternalId;
    externalId?: CogniteExternalId;
    timestamp: Timestamp;
    channelId: CogniteInternalId
    channelExternalId?: CogniteExternalId
    source: string
    value?: string
    level?: "DEBUG" | "INFO" | "WARNING" | "ERROR" | "CRITICAL"
    metadata?: Metadata
    acknowledged: boolean
    closed: boolean
}

export interface ChannelCreate {
    externalId?: CogniteExternalId
    parentExternalId?: CogniteExternalId
    parentId?: CogniteInternalId
    name: string
    description?: string
    metadata?: Metadata
}

export interface Channel {
    id: CogniteInternalId
    externalId?: CogniteExternalId
    parentExternalId?: CogniteExternalId
    parentId?: CogniteInternalId
    name: string
    description?: string
    metadata?: Metadata
}

export interface ChannelFilter extends FilterQuery {
    ids?: CogniteInternalId[]
    externalIds?: CogniteExternalId[]
    parentIds?: CogniteInternalId[]
    metadata?: Metadata
}

export interface ChannelPatch {
    update: {
      externalId?: SinglePatchString;
      name?: SinglePatchRequiredString;
      description?: SinglePatchString;
      metadata?: MetadataPatch;
    };
  }

export interface ChannelChangeById extends ChannelPatch, InternalId {}
export interface ChannelChangeByExternalId extends ChannelPatch, ExternalId {}
export type ChannelChange = ChannelChangeById | ChannelChangeByExternalId;


export interface SubscriberCreate {
    externalId?: CogniteExternalId
    metadata?: Metadata
    email: string
}

export interface Subscriber {
    id: CogniteInternalId
    externalId?: CogniteExternalId
    metadata?: Metadata
    email: string
}

export interface SubscriberCreate {
    externalId?: CogniteExternalId
    metadata?: Metadata
    email: string
}

export interface SubscriptionCreate {
    externalId?: CogniteExternalId
    channelId?: CogniteInternalId
    channelExternalId?: CogniteExternalId
    subscriberId?: CogniteInternalId
    subscriberExternalId?: CogniteExternalId
    metadata?: Metadata
}

export interface SubscriptionDelete {
    externalId?: CogniteExternalId
    channelExternalId?: CogniteExternalId
    channelId?: CogniteInternalId
    subscriberId?: CogniteInternalId
    subscriberExternalId?: CogniteExternalId
}

export interface Subscription {
    externalId?: CogniteExternalId
    channelId: CogniteInternalId
    channelExternalId?: CogniteExternalId
    subscriberId: CogniteInternalId
    subscriberExternalId?: CogniteExternalId
    metadata?: Metadata
}