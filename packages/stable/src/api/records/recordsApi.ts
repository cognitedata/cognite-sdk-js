// Copyright 2025 Cognite AS

import { BaseResourceAPI } from '@cognite/sdk-core';
import type {
  RecordFilterRequest,
  RecordFilterResponse,
  RecordItem,
  RecordWrite,
} from './types';

export class RecordsAPI extends BaseResourceAPI<RecordItem> {
  /**
   * @hidden
   */
  protected getDateProps() {
    return this.pickDateProps(['items'], ['createdTime', 'lastUpdatedTime']);
  }

  /**
   * [Ingest records into a stream](https://developer.cognite.com/api#tag/Records/operation/ingestRecords)
   *
   * Ingest records into a stream.
   *
   * ```js
   * await client.records.ingest('my_stream', [
   *   {
   *     space: 'mySpace',
   *     externalId: 'record1',
   *     sources: [
   *       {
   *         source: { type: 'container', space: 'mySpace', externalId: 'myContainer' },
   *         properties: { temperature: 25.5, timestamp: '2025-01-01T00:00:00Z' }
   *       }
   *     ]
   *   }
   * ]);
   * ```
   */
  public ingest = async (
    streamExternalId: string,
    items: RecordWrite[]
  ): Promise<void> => {
    const path = this.url(`${streamExternalId}/records`);
    await this.post<object>(path, {
      data: { items },
    });
  };

  /**
   * [Filter records from a stream](https://developer.cognite.com/api#tag/Records/operation/filterRecords)
   *
   * Retrieve records from a stream using filters.
   *
   * ```js
   * const response = await client.records.filter('my_stream', {
   *   sources: [
   *     {
   *       source: { type: 'container', space: 'mySpace', externalId: 'myContainer' },
   *       properties: ['*']
   *     }
   *   ],
   *   filter: {
   *     equals: {
   *       property: ['mySpace', 'myContainer', 'status'],
   *       value: 'active'
   *     }
   *   },
   *   limit: 100
   * });
   * ```
   */
  public filter = async (
    streamExternalId: string,
    request: RecordFilterRequest = {}
  ): Promise<RecordItem[]> => {
    const path = this.url(`${streamExternalId}/records/filter`);
    const response = await this.post<RecordFilterResponse>(path, {
      data: request,
    });
    return this.addToMapAndReturn(response.data.items, response);
  };
}
