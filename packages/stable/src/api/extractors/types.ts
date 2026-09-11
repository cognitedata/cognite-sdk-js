// Copyright 2026 Cognite AS

import type { FilterQuery } from '@cognite/sdk-core';

export interface ExtractorReleasesListQuery extends FilterQuery {
  externalId?: string;
}

export type ExtractorSchema = Record<string, unknown>;
