// Copyright 2018 Cognite AS

import { AxiosResponse } from 'axios';
import { apiUrl, metadataMap, projectUrl, rawGet, rawPost } from './core';

export interface Event {
  id: number;
  startTime?: number;
  endTime?: number;
  description?: string;
  type?: string;
  subtype?: string;
  assetIds: number[];
  source?: string;
  sourceId?: string;
  metadata?: { [key: string]: string };
  createdTime: number;
  lastUpdatedTime: number;
}

interface EventDataResponse {
  data: {
    items: Event[];
  };
}

export interface EventDataWithCursor {
  previousCursor?: string;
  nextCursor?: string;
  items: Event[];
}

interface EventDataWithCursorResponse {
  data: EventDataWithCursor;
}

export interface EventListParams {
  type?: string;
  subtype?: string;
  assetId?: number;
  sort?: string;
  cursor?: string;
  limit?: number;
  hasDescription?: boolean;
  minStartTime?: number;
  maxStartTime?: number;
  source?: string;
}

export interface EventSearchParams {
  description?: string;
  type?: string;
  subtype?: string;
  minStartTime?: number;
  maxStartTime?: number;
  minEndTime?: number;
  maxEndTime?: number;
  minCreatedTime?: number;
  maxCreatedTime?: number;
  minLastUpdatedTime?: number;
  maxLastUpdatedTime?: number;
  metadata?: { [k: string]: string };
  assetIds?: number[];
  assetSubtrees?: number[];
  sort?: string;
  dir?: string;
  limit?: number;
  offset?: number;
}

/**
 * @hidden
 */
const eventsUrl = (): string => `${apiUrl(0.5)}/${projectUrl()}/events`;

export class Events {
  public static async create(events: Partial<Event>[]): Promise<Event[]> {
    const body = {
      items: events,
    };
    const url = eventsUrl();
    const response = (await rawPost(url, { data: body })) as AxiosResponse<
      EventDataResponse
    >;
    return response.data.data.items;
  }

  public static async retrieve(eventId: number): Promise<Event> {
    const url = `${eventsUrl()}/${eventId}`;
    const response = (await rawGet(url)) as AxiosResponse<EventDataResponse>;
    return response.data.data.items[0];
  }

  public static async retrieveMultiple(eventIds: number[]): Promise<Event[]> {
    const body = {
      items: eventIds,
    };
    const url = `${eventsUrl()}/byids`;
    const response = (await rawPost(url, { data: body })) as AxiosResponse<
      EventDataResponse
    >;
    return response.data.data.items;
  }

  public static async update(events: Event[]): Promise<void> {
    const body = {
      items: events,
    };
    const url = `${eventsUrl()}/update`;
    await rawPost(url, { data: body });
  }

  public static async delete(eventIds: number[]): Promise<void> {
    const body = {
      items: eventIds,
    };
    const url = `${eventsUrl()}/delete`;
    await rawPost(url, { data: body });
  }

  public static async list(
    params?: EventListParams
  ): Promise<EventDataWithCursor> {
    const url = eventsUrl();
    const response = (await rawGet(url, { params })) as AxiosResponse<
      EventDataWithCursorResponse
    >;
    return response.data.data;
  }

  public static async search(
    params: EventSearchParams
  ): Promise<EventDataWithCursor> {
    const url = `${eventsUrl()}/search`;
    const response = (await rawGet(url, { params })) as AxiosResponse<
      EventDataWithCursorResponse
    >;
    return metadataMap.addAndReturn(response.data.data, response);
  }
}
