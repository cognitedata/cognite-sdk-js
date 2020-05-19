// Copyright 2019 Cognite AS

import { CursorAndAsyncIterator } from '../../autoPagination';
import { BaseResourceAPI } from '../../resources/baseResourceApi';
import {
  CogniteEvent,
  EventAggregate,
  EventAggregateQuery,
  EventChange,
  EventFilterRequest,
  EventSearchRequest,
  EventSort,
  ExternalEvent,
  IdEither,
  IgnoreUnknownIds,
} from '../../types/types';

export class EventsAPI extends BaseResourceAPI<CogniteEvent> {
  /**
   * [Create events](https://doc.cognitedata.com/api/v1/#operation/createEvents)
   *
   * ```js
   * const events = [
   *   { description: 'Workorder pump abc', startTime: new Date('22 jan 2019') },
   *   { description: 'Broken rule', externalId: 'rule123', startTime: 1557346524667000 },
   * ];
   * const createdEvents = await client.events.create(events);
   * ```
   */
  public create = (items: ExternalEvent[]): Promise<CogniteEvent[]> => {
    return super.createEndpoint(items);
  };

  /**
   * [List events](https://doc.cognitedata.com/api/v1/#operation/advancedListEvents)
   * <!-- or [similar](https://doc.cognitedata.com/api/v1/#operation/listEvents) -->
   *
   * ```js
   * const events = await client.events.list({ filter: { startTime: { min: new Date('1 jan 2018') }, endTime: { max: new Date('1 jan 2019') } } });
   * ```
   */
  public list = (
    scope?: EventFilterRequest
  ): CursorAndAsyncIterator<CogniteEvent> => {
    const { sort: sortObject = {}, ...rest } = scope || {};
    const query = { sort: this.convertSortObjectToArray(sortObject), ...rest };
    return super.listEndpoint(this.callListEndpointWithPost, query);
  };

  /**
   * [Aggregate events](https://docs.cognite.com/api/v1/#operation/aggregateEvents)
   *
   * ```js
   * const aggregates = await client.events.aggregate({ filter: { assetIds: [1, 2, 3] } });
   * console.log('Number of events: ', aggregates[0].count)
   * ```
   */
  public aggregate = (
    query: EventAggregateQuery
  ): Promise<EventAggregate[]> => {
    return super.aggregateEndpoint(query);
  };

  /**
   * [Retrieve events](https://doc.cognitedata.com/api/v1/#operation/byIdsEvents)
   * <!-- or [similar](https://doc.cognitedata.com/api/v1/#operation/getEventByInternalId) -->
   *
   * ```js
   * const events = await client.events.retrieve([{id: 123}, {externalId: 'abc'}]);
   * ```
   */
  public retrieve = (ids: IdEither[], params: EventRetrieveParams = {}) => {
    return super.retrieveEndpoint(ids, params);
  };

  /**
   * [Update events](https://doc.cognitedata.com/api/v1/#operation/updateEvents)
   *
   * ```js
   * const events = await client.events.update([{id: 123, update: {description: {set: 'New description'}}}]);
   * ```
   */
  public update = (changes: EventChange[]) => {
    return super.updateEndpoint(changes);
  };

  /**
   * [Search for events](https://doc.cognitedata.com/api/v1/#operation/searchEvents)
   *
   * ```js
   * const events = await client.events.search({
   *   filter: {
   *     assetIds: [1, 2]
   *   },
   *   search: {
   *     description: 'Pump'
   *   }
   * });
   * ```
   */
  public search = (query: EventSearchRequest) => {
    return super.searchEndpoint(query);
  };

  /**
   * [Delete events](https://doc.cognitedata.com/api/v1/#operation/deleteEvents)
   *
   * ```js
   * await client.events.delete([{id: 123}, {externalId: 'abc'}]);
   * ```
   */
  public delete = (ids: IdEither[]) => {
    return super.deleteEndpoint(ids);
  };

  private convertSortObjectToArray(sortObject: EventSort) {
    return Object.entries(sortObject).map(
      ([prop, order]) => `${prop}:${order}`
    );
  }
}

export type EventRetrieveParams = IgnoreUnknownIds;
