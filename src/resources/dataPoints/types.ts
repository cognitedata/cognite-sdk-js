// Copyright 2019 Cognite AS

import {
  DatapointsGetAggregateDatapoint,
  DatapointsGetDatapoint,
  ItemsWrapper,
} from '../..';
import { HttpResponse } from '../../utils/http/basicHttpClient';

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

export type QueryResponse = HttpResponse<
  ItemsWrapper<(DatapointsGetAggregateDatapoint | DatapointsGetDatapoint)[]>
>;
