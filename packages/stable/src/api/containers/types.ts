// Copyright 2026 Cognite AS

import type {
  CursorQueryParameter,
  IncludeGlobalQueryParameter,
  ReducedLimitQueryParameter,
  SpaceQueryParameter,
  UsedFor as ContainerUsedFor,
  UsedForQueryParameter,
} from './types.gen';

export type { ContainerUsedFor };

export type ContainerListParams = IncludeGlobalQueryParameter &
  CursorQueryParameter &
  ReducedLimitQueryParameter &
  SpaceQueryParameter &
  UsedForQueryParameter;
