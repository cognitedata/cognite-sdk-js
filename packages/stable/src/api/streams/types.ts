// Copyright 2025 Cognite AS

import type { CreatedTime } from '../../types';
import type {
  CreateStreamSettings,
  StreamRequestItem,
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
 * Not generated: the API returns `createdTime` as an epoch timestamp, which the
 * SDK converts to a `Date` before handing it back. See the `relevantReferenceNames`
 * roots in `codegen.json`, which keep `StreamResponseItem` out of `types.gen.ts`
 * so this name stays free.
 */
export interface Stream extends CreatedTime {
  /**
   * Stream identifier
   */
  externalId: string;
  /**
   * Name of the template used for creating this stream.
   */
  createdFromTemplate: string;
  /**
   * Defines type of the stream.
   */
  type: 'Immutable' | 'Mutable';
  /**
   * Stream settings
   */
  settings: StreamResponseItemSettings;
}

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
