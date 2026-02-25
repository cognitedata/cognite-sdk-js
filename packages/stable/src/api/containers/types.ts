// Copyright 2026 Cognite AS

import type {
  UsedFor as ContainerUsedFor,
  CursorQueryParameter,
  IncludeGlobalQueryParameter,
  ReducedLimitQueryParameter,
  SpaceQueryParameter,
  UsedForQueryParameter,
} from './types.gen';

export type { ContainerUsedFor };

export type ContainerListParams = IncludeGlobalQueryParameter &
  CursorQueryParameter &
  ReducedLimitQueryParameter &
  SpaceQueryParameter &
  UsedForQueryParameter;
