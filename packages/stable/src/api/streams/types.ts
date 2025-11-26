// Copyright 2025 Cognite AS

import type { CreatedTime } from '../../types';

/**
 * Stream write - the input type for creating a stream
 */
export interface StreamWrite {
  /**
   * Stream identifier. Must be unique within the project.
   */
  externalId: string;
  /**
   * Stream settings which should be applied to the stream
   */
  settings: StreamCreateSettings;
}

/**
 * Settings for creating a stream
 */
export interface StreamCreateSettings {
  /**
   * Reference to a template which should be used to define initial settings for the stream
   */
  template: {
    /**
     * The stream settings template name
     */
    name: string;
  };
}

/**
 * A stream - target for high volume data ingestion
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
  settings: StreamSettings;
}

/**
 * Stream settings returned from the API
 */
export interface StreamSettings {
  /**
   * Data lifecycle settings
   */
  lifecycle: StreamLifecycleSettings;
  /**
   * Limits and usage
   */
  limits: StreamLimitSettings;
}

/**
 * Data lifecycle settings
 */
export interface StreamLifecycleSettings {
  /**
   * Time specifying how long to retain a record in this stream.
   */
  dataDeletedAfter?: string;
  /**
   * Time until the soft deleted stream will actually be deleted by the system,
   */
  retainedAfterSoftDelete: string;
}

/**
 * Limits and usage for a stream
 */
export interface StreamLimitSettings {
  /**
   * Maximum number of records that can be stored in the stream
   */
  maxRecordsTotal: StreamLimit;
  /**
   * Maximum amount of data that can be stored in the stream, in gigabytes
   */
  maxGigaBytesTotal: StreamLimit;
  /**
   * Maximum length of time that the lastUpdatedTime filter can retrieve records for
   */
  maxFilteringInterval?: string;
}

/**
 * Stream limit with provisioned and consumed values
 */
export interface StreamLimit {
  /**
   * Amount of resource provisioned
   */
  provisioned: number;
  /**
   * Amount of resource consumed
   */
  consumed?: number;
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
