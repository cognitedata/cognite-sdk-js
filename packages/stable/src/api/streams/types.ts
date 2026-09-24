// Copyright 2025 Cognite AS

import type { CreatedTime } from '../../types';
import type {
  CreateStreamSettings,
  StreamRequestItem,
  StreamResponseItem,
  StreamResponseItemSettings,
} from './types.gen';

/**
 * Stream write - the input type for creating a stream
 *
 * @deprecated Kept for backwards compatibility. Use {@link StreamRequestItem}.
 */
export type StreamWrite = StreamRequestItem;

/**
 * Settings for creating a stream
 *
 * @deprecated Kept for backwards compatibility. Use {@link CreateStreamSettings}.
 */
export type StreamCreateSettings = CreateStreamSettings;

/**
 * Stream settings returned from the API
 *
 * @deprecated Kept for backwards compatibility. Use {@link StreamResponseItemSettings}.
 */
export type StreamSettings = StreamResponseItemSettings;

/**
 * A stream - target for high volume data ingestion.
 *
 * Identical to the generated {@link StreamResponseItem}, except that the SDK
 * converts `createdTime` from an epoch timestamp to a `Date`.
 */
export interface Stream
  extends Omit<StreamResponseItem, 'createdTime'>,
    CreatedTime {}

/**
 * Parameters for retrieving a stream
 */
export interface StreamRetrieveParams {
  /**
   * Stream identifier
   */
  externalId: string;
  /**
   * If set to true, usage statistics will be returned together with stream settings
   */
  includeStatistics?: boolean;
}
