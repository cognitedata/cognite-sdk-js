// Copyright 2020 Cognite AS

import { BaseResourceAPI } from '@cognite/sdk-core';
import type {
  AggregateResponse,
  EventAggregateQuery,
  EventUniqueValuesAggregate,
  UniqueValuesAggregateResponse,
} from '../../types';

export class EventsAggregateAPI extends BaseResourceAPI<unknown> {
  /**
   * [Aggregate events](https://docs.cognite.com/api/v1/#operation/aggregateEvents)
   *
   * ```js
   * const aggregates = await client.events.aggregate.count({ filter: { assetIds: [1, 2, 3] } });
   * console.log('Number of events: ', aggregates[0].count)
   * ```
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
   */
  public uniqueValues = (
    query: EventUniqueValuesAggregate,
  ): Promise<UniqueValuesAggregateResponse[]> => {
    return super.aggregateEndpoint({
      ...query,
      aggregate: 'uniqueValues',
    });
  };
}
