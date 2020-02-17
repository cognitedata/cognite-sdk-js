// Copyright 2019 Cognite AS

import ms from 'ms';
import { DatapointsMultiQuery } from '../..';
import { PotentiallyUndefinedQueryValues } from './types';

function cleanQueryInput(
  q: DatapointsMultiQuery
): PotentiallyUndefinedQueryValues {
  function alwaysReturnNumber(value: string | number | Date): number {
    if (typeof value === 'string') {
      return ms(value);
    }
    if (value instanceof Date) {
      return value.getMilliseconds();
    }
    return value;
  }
  function numberOrUndefined(
    // tslint:disable-next-line:max-union-size
    value: number | string | Date | undefined
  ): number | undefined {
    return typeof value === 'undefined' ? value : alwaysReturnNumber(value);
  }
  const start = numberOrUndefined(q.start);
  const end = numberOrUndefined(q.end);
  const limit = numberOrUndefined(q.limit);
  const granularity: undefined | number = numberOrUndefined(q.granularity);

  return { start, end, limit, granularity };
}
