// Copyright 2019 Cognite AS

export interface PotentiallyUndefinedQueryValues {
  start?: number;
  end?: number;
  limit?: number;
  granularity?: number;
}

export interface ConsolidatedQueryValues {
  start: number;
  end: number;
  limit: number;
  granularity: number;
}
