// Copyright 2020 Cognite AS

import { BaseResourceAPI } from '@cognite/sdk-core';
import type {
  AggregateResponse,
  EventAggregateQuery,
  EventUniqueValuesAggregate,
  UniqueValuesAggregateResponse,
} from '../../types';

/**
 * @deprecated Asset-centric API, to be retired end of 2027. Will move to `client.legacy.events` in the next major release. See https://github.com/cognitedata/cognite-sdk-js/blob/master/guides/DEPRECATIONS.md for details.
 */
export class EventsAggregateAPI extends BaseResourceAPI<unknown> {
  /**
   * [Aggregate events](https://docs.cognite.com/api/v1/#operation/aggregateEvents)
   *
   * ```js
   * const aggregates = await client.events.aggregate.count({ filter: { assetIds: [1, 2, 3] } });
   * console.log('Number of events: ', aggregates[0].count)
   * ```
   *
   * @deprecated Asset-centric API, to be retired end of 2027. Will move to `client.legacy.events` in the next major release.
   */
  public count = (query: EventAggregateQuery): Promise<AggregateResponse[]> => {
    return super.aggregateEndpoint(query);
  };

  /**
   * [Aggregate events](https://docs.cognite.com/api/v1/#operation/aggregateEvents)
   *
   * ```js
   * const uniqueValues = await client.events.aggregate.uniqueValues({ filter: { assetIds: [1, 2, 3] }, fields: ['subtype'] });
   * console.log('Unique values: ', uniqueValues)
   * ```
   *
   * @deprecated Asset-centric API, to be retired end of 2027. Will move to `client.legacy.events` in the next major release.
   */
  public uniqueValues = (
    query: EventUniqueValuesAggregate
  ): Promise<UniqueValuesAggregateResponse[]> => {
    return super.aggregateEndpoint({
      ...query,
      aggregate: 'uniqueValues',
    });
  };
}
