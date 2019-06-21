// Copyright 2019 Cognite AS

import { AxiosInstance } from 'axios';
import { CogniteAsyncIterator } from '../../autoPagination';
import { MetadataMap } from '../../metadata';
import {
  generateCreateEndpoint,
  generateDeleteEndpoint,
  generateListEndpoint,
  generateRetrieveEndpoint,
  generateSearchEndpoint,
  generateUpdateEndpoint,
} from '../../standardMethods';
import {
  CogniteEvent,
  EventChange,
  EventFilterRequest,
  EventSearchRequest,
  ExternalEvent,
  IdEither,
} from '../../types';
import { projectUrl } from '../../utils';

export class EventsAPI {
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
  public create: EventsCreateEndpoint;

  /**
   * [List events](https://doc.cognitedata.com/api/v1/#operation/advancedListEvents)
   * <!-- or [similar](https://doc.cognitedata.com/api/v1/#operation/listEvents) -->
   *
   * ```js
   * const events = await client.events.list({ filter: { startTime: { min: new Date('1 jan 2018') }, endTime: { max: new Date('1 jan 2019') } } });
   * ```
   */
  public list: EventsListEndpoint;

  /**
   * [Retrieve events](https://doc.cognitedata.com/api/v1/#operation/byIdsEvents)
   * <!-- or [similar](https://doc.cognitedata.com/api/v1/#operation/getEventByInternalId) -->
   *
   * ```js
   * const events = await client.events.retrieve([{id: 123}, {externalId: 'abc'}]);
   * ```
   */
  public retrieve: EventsRetrieveEndpoint;

  /**
   * [Update events](https://doc.cognitedata.com/api/v1/#operation/updateEvents)
   *
   * ```js
   * const events = await client.events.update([{id: 123, update: {description: {set: 'New description'}}}]);
   * ```
   */
  public update: EventsUpdateEndpoint;

  /**
   * [Search for events](https://doc.cognitedata.com/api/v1/#operation/searchEvents)
   *
   * ```js
   * const events = await client.events.search([{
   *   filter: {
   *     assetSubtrees: [1, 2]
   *   },
   *   search: {
   *     description: 'Pump'
   *   }
   * }]);
   * ```
   */
  public search: EventsSearchEndpoint;

  /**
   * [Delete events](https://doc.cognitedata.com/api/v1/#operation/deleteEvents)
   *
   * ```js
   * await client.events.delete([{id: 123}, {externalId: 'abc'}]);
   * ```
   */
  public delete: EventsDeleteEndpoint;

  /** @hidden */
  constructor(project: string, instance: AxiosInstance, map: MetadataMap) {
    const path = projectUrl(project) + '/events';
    this.create = generateCreateEndpoint(instance, path, map);
    this.list = generateListEndpoint(instance, path, map, true);
    this.retrieve = generateRetrieveEndpoint(instance, path, map);
    this.update = generateUpdateEndpoint(instance, path, map);
    this.search = generateSearchEndpoint(instance, path, map);
    this.delete = generateDeleteEndpoint(instance, path, map);
  }
}

export type EventsCreateEndpoint = (
  items: ExternalEvent[]
) => Promise<CogniteEvent[]>;

export type EventsListEndpoint = (
  scope?: EventFilterRequest
) => CogniteAsyncIterator<CogniteEvent>;

export type EventsRetrieveEndpoint = (
  ids: IdEither[]
) => Promise<CogniteEvent[]>;

export type EventsUpdateEndpoint = (
  changes: EventChange[]
) => Promise<CogniteEvent[]>;

export type EventsSearchEndpoint = (
  query: EventSearchRequest
) => Promise<CogniteEvent[]>;

export type EventsDeleteEndpoint = (ids: IdEither[]) => Promise<{}>;
