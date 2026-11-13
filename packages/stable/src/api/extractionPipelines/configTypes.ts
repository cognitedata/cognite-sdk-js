// Copyright 2026 Cognite AS

import type { CogniteExternalId, FilterQuery } from '@cognite/sdk-core';
import type { EpochTimestamp } from '../../types.gen';

export interface ExtractionPipelineConfigRevision {
  /**
   * External ID of the extraction pipeline the revision belongs to.
   */
  externalId: CogniteExternalId;
  revision: number;
  createdTime?: EpochTimestamp;
  description?: string | null;
}

export interface ExtractionPipelineConfig
  extends ExtractionPipelineConfigRevision {
  /**
   * Configuration content.
   */
  config?: string;
}

export interface ExtractionPipelineConfigCreate {
  /**
   * External ID of the extraction pipeline the revision belongs to.
   * 1 to 255 characters.
   */
  externalId: CogniteExternalId;
  /**
   * Configuration content.
   */
  config?: string;
  description?: string | null;
}

export interface ExtractionPipelineConfigRetrieveParams {
  /**
   * External ID of the extraction pipeline.
   */
  externalId: CogniteExternalId;
  /**
   * Revision number to retrieve. The latest revision is retrieved if omitted.
   */
  revision?: number;
  /**
   * Retrieve the revision that was active at this time.
   */
  activeAtTime?: EpochTimestamp;
}

export interface ExtractionPipelineConfigListQuery extends FilterQuery {
  /**
   * External ID of the extraction pipeline.
   */
  externalId: CogniteExternalId;
}

export interface ExtractionPipelineConfigRevertRequest {
  /**
   * External ID of the extraction pipeline.
   */
  externalId: CogniteExternalId;
  /**
   * Revision number to revert to.
   */
  revision: number;
}
