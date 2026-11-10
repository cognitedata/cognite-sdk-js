// Copyright 2026 Cognite AS

import type { CogniteExternalId, CogniteInternalId } from '@cognite/sdk-core';
import type {
  Metadata,
  MetadataPatch,
  SinglePatch,
  SinglePatchString,
} from '../../types';
import type { EpochTimestamp } from '../../types.gen';
import type { SessionId } from '../sessions/types';

/**
 * Credentials for writing to CDF through a CDF session.
 */
export interface HostedExtractorDestinationCredentials {
  /**
   * Nonce of a recently created CDF session.
   */
  nonce: string;
}

interface HostedExtractorDestinationCommon {
  externalId: CogniteExternalId;
  /**
   * Data set the created items are inserted into, if applicable.
   */
  targetDataSetId?: CogniteInternalId;
  /**
   * At most 50 characters.
   */
  name?: string;
  /**
   * At most 500 characters.
   */
  description?: string;
  metadata?: Metadata;
}

export interface HostedExtractorDestination
  extends HostedExtractorDestinationCommon {
  /**
   * ID of the session tied to this destination. The session nonce is not
   * returned.
   */
  sessionId?: SessionId;
  createdTime: EpochTimestamp;
  lastUpdatedTime: EpochTimestamp;
}

export interface HostedExtractorDestinationCreate
  extends HostedExtractorDestinationCommon {
  credentials?: HostedExtractorDestinationCredentials;
}

export interface HostedExtractorDestinationPatch {
  credentials?: SinglePatch<HostedExtractorDestinationCredentials>;
  targetDataSetId?: SinglePatch<CogniteInternalId>;
  name?: SinglePatchString;
  description?: SinglePatchString;
  metadata?: MetadataPatch;
}

export interface HostedExtractorDestinationChange {
  externalId: CogniteExternalId;
  update: HostedExtractorDestinationPatch;
}
