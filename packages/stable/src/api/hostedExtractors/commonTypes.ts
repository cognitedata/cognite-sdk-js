// Copyright 2026 Cognite AS

import type { IgnoreUnknownIds } from '../../types';

export interface HostedExtractorDeleteParams extends IgnoreUnknownIds {
  /**
   * Also delete the jobs that use the deleted items. Without it, deleting
   * an item that a job uses fails.
   */
  force?: boolean;
}
