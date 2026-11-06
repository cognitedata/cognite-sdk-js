// Copyright 2026 Cognite AS

import type { IgnoreUnknownIds } from '../../types';

/**
 * Custom, application specific metadata. Limits are 16 key-value pairs,
 * 512 bytes per value, and 4096 bytes total.
 */
export type HostedExtractorMetadata = Record<string, string>;

/**
 * Replace all metadata with `set`, or add and remove individual keys.
 */
export type HostedExtractorMetadataPatch =
  | { set: HostedExtractorMetadata }
  | {
      /**
       * Add or overwrite these key-value pairs.
       */
      add?: HostedExtractorMetadata;
      /**
       * Remove the entries with these keys. At most 16 keys.
       */
      remove?: string[];
    };

export interface HostedExtractorDeleteParams extends IgnoreUnknownIds {
  /**
   * Also delete the jobs that use the deleted items. Without it, deleting
   * an item that a job uses fails.
   */
  force?: boolean;
}
