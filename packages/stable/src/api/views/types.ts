// Copyright 2026 Cognite AS

import type {
  AllVersionsQueryParameter,
  CursorQueryParameter,
  IncludeGlobalQueryParameter,
  IncludeInheritedPropertiesQueryParameter,
  ReducedLimitQueryParameter,
  SpaceQueryParameter,
  UsedForQueryParameter,
  UsedFor as ViewUsedFor,
} from './types.gen';

export type { ViewUsedFor };

export type ViewListParams = IncludeGlobalQueryParameter &
  CursorQueryParameter &
  ReducedLimitQueryParameter &
  SpaceQueryParameter &
  IncludeInheritedPropertiesQueryParameter &
  AllVersionsQueryParameter &
  UsedForQueryParameter;
