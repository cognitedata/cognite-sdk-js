// Copyright 2019 Cognite AS

import { AxiosInstance } from 'axios';
import { CogniteAsyncIterator } from '../autoPagination';
import { MetadataMap } from '../metadata';
import {
  generateCreateEndpoint,
  generateDeleteEndpoint,
  generateListEndpoint,
  generateRetrieveEndpoint,
  generateSearchEndpoint,
  generateUpdateEndpoint,
} from '../standardMethods';
import {
  CogniteEvent,
  EventChange,
  EventFilterRequest,
  EventSearchRequest,
  ExternalEvent,
  IdEither,
} from '../types/types';
import { projectUrl } from '../utils';

export interface EventAPI {
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
  create: (items: ExternalEvent[]) => Promise<CogniteEvent[]>;

  /**
   * [List events](https://doc.cognitedata.com/api/v1/#operation/advancedListEvents)
   *
   * ```js
   * const events = await client.events.list({ filter: { startTime: { min: new Date('1 jan 2018') }, endTime: { max: new Date('1 jan 2019') } } });
   * ```
   */
  list: (scope?: EventFilterRequest) => CogniteAsyncIterator<CogniteEvent>;

  /**
   * [Retrieve events](https://doc.cognitedata.com/api/v1/#operation/byIdsEvents)
   *
   * ```js
   * const events = await client.events.retrieve([{id: 123}, {externalId: 'abc'}]);
   * ```
   */
  retrieve: (ids: IdEither[]) => Promise<CogniteEvent[]>;

  /**
   * [Update events](https://doc.cognitedata.com/api/v1/#operation/updateEvents)
   *
   * ```js
   * const events = await client.events.update([{id: 123, update: {description: {set: 'New description'}}}]);
   * ```
   */
  update: (changes: EventChange[]) => Promise<CogniteEvent[]>;

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
  search: (query: EventSearchRequest) => Promise<CogniteEvent[]>;

  /**
   * [Delete events](https://doc.cognitedata.com/api/v1/#operation/deleteEvents)
   *
   * ```js
   * await client.events.delete([{id: 123}, {externalId: 'abc'}]);
   */
  delete: (ids: IdEither[]) => Promise<{}>;
}

/** @hidden */
export function generateEventsObject(
  project: string,
  instance: AxiosInstance,
  map: MetadataMap
): EventAPI {
  const path = projectUrl(project) + '/events';
  return {
    create: generateCreateEndpoint(instance, path, map),
    list: generateListEndpoint(instance, path, map, true),
    retrieve: generateRetrieveEndpoint(instance, path, map),
    update: generateUpdateEndpoint(instance, path, map),
    search: generateSearchEndpoint(instance, path, map),
    delete: generateDeleteEndpoint(instance, path, map),
  };
}
