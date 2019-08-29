// Copyright 2019 Cognite AS

import { BaseResourceAPI } from '@/resources/baseResourceApi';
import { CursorAndAsyncIterator } from '@/standardMethods';
import {
  CogniteEvent,
  EventChange,
  EventFilterRequest,
  EventSearchRequest,
  ExternalEvent,
  IdEither,
} from '@/types/types';

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
  public async create(items: ExternalEvent[]): Promise<CogniteEvent[]> {
    return super.createEndpoint(items);
  }

  /**
   * [List events](https://doc.cognitedata.com/api/v1/#operation/advancedListEvents)
   * <!-- or [similar](https://doc.cognitedata.com/api/v1/#operation/listEvents) -->
   *
   * ```js
   * const events = await client.events.list({ filter: { startTime: { min: new Date('1 jan 2018') }, endTime: { max: new Date('1 jan 2019') } } });
   * ```
   */
  public list(
    scope?: EventFilterRequest
  ): CursorAndAsyncIterator<CogniteEvent> {
    return super.listEndpoint(this.callListEndpointWithPost, scope);
  }

  /**
   * [Retrieve events](https://doc.cognitedata.com/api/v1/#operation/byIdsEvents)
   * <!-- or [similar](https://doc.cognitedata.com/api/v1/#operation/getEventByInternalId) -->
   *
   * ```js
   * const events = await client.events.retrieve([{id: 123}, {externalId: 'abc'}]);
   * ```
   */
  public async retrieve(ids: IdEither[]) {
    return super.retrieveEndpoint(ids);
  }

  /**
   * [Update events](https://doc.cognitedata.com/api/v1/#operation/updateEvents)
   *
   * ```js
   * const events = await client.events.update([{id: 123, update: {description: {set: 'New description'}}}]);
   * ```
   */
  public async update(changes: EventChange[]) {
    return super.updateEndpoint(changes);
  }

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
  public async search(query: EventSearchRequest) {
    return super.searchEndpoint(query);
  }

  /**
   * [Delete events](https://doc.cognitedata.com/api/v1/#operation/deleteEvents)
   *
   * ```js
   * await client.events.delete([{id: 123}, {externalId: 'abc'}]);
   * ```
   */
  public async delete(ids: IdEither[]) {
    return super.deleteEndpoint(ids);
  }
}
