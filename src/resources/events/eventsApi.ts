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
} from '../../types/types';
import { projectUrl } from '../../utils';

export class EventsAPI {
  private createEndpoint: EventsCreateEndpoint;
  private listEndpoint: EventsListEndpoint;
  private retrieveEndpoint: EventsRetrieveEndpoint;
  private updateEndpoint: EventsUpdateEndpoint;
  private searchEndpoint: EventsSearchEndpoint;
  private deleteEndpoint: EventsDeleteEndpoint;

  /** @hidden */
  constructor(project: string, instance: AxiosInstance, map: MetadataMap) {
    const path = projectUrl(project) + '/events';
    this.createEndpoint = generateCreateEndpoint(instance, path, map);
    this.listEndpoint = generateListEndpoint(instance, path, map, true);
    this.retrieveEndpoint = generateRetrieveEndpoint(instance, path, map);
    this.updateEndpoint = generateUpdateEndpoint(instance, path, map);
    this.searchEndpoint = generateSearchEndpoint(instance, path, map);
    this.deleteEndpoint = generateDeleteEndpoint(instance, path, map);
  }

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
  public create: EventsCreateEndpoint = items => {
    return this.createEndpoint(items);
  };

  /**
   * [List events](https://doc.cognitedata.com/api/v1/#operation/advancedListEvents)
   *
   * ```js
   * const events = await client.events.list({ filter: { startTime: { min: new Date('1 jan 2018') }, endTime: { max: new Date('1 jan 2019') } } });
   * ```
   */
  public list: EventsListEndpoint = scope => {
    return this.listEndpoint(scope);
  };

  /**
   * [Retrieve events](https://doc.cognitedata.com/api/v1/#operation/byIdsEvents)
   *
   * ```js
   * const events = await client.events.retrieve([{id: 123}, {externalId: 'abc'}]);
   * ```
   */
  public retrieve: EventsRetrieveEndpoint = ids => {
    return this.retrieveEndpoint(ids);
  };

  /**
   * [Update events](https://doc.cognitedata.com/api/v1/#operation/updateEvents)
   *
   * ```js
   * const events = await client.events.update([{id: 123, update: {description: {set: 'New description'}}}]);
   * ```
   */
  public update: EventsUpdateEndpoint = changes => {
    return this.updateEndpoint(changes);
  };

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
  public search: EventsSearchEndpoint = query => {
    return this.searchEndpoint(query);
  };

  /**
   * [Delete events](https://doc.cognitedata.com/api/v1/#operation/deleteEvents)
   *
   * ```js
   * await client.events.delete([{id: 123}, {externalId: 'abc'}]);
   * ```
   */
  public delete: EventsDeleteEndpoint = ids => {
    return this.deleteEndpoint(ids);
  };
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
