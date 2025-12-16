// Copyright 2025 Cognite AS

import type { CursorAndAsyncIterator } from '@cognite/sdk-core';
import { BaseResourceAPI } from '@cognite/sdk-core';
import type {
  RecordFilterRequest,
  RecordFilterResponse,
  RecordItem,
  RecordSyncRequest,
  RecordSyncResponse,
  RecordWrite,
  SyncRecordItem,
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

  /**
   * [Sync records from a stream](https://developer.cognite.com/api#tag/Records/operation/syncRecords)
   *
   * Sync records from a stream using a cursor-based approach. Supports auto-pagination.
   *
   * ```js
   * // Get first page
   * const response = await client.records.sync('my_stream', {
   *   initializeCursor: '1d-ago',
   *   sources: [{ source: { type: 'container', space: 'mySpace', externalId: 'myContainer' }, properties: ['*'] }],
   * });
   *
   * // Auto-paginate to array
   * const allRecords = await client.records
   *   .sync('my_stream', { initializeCursor: '1d-ago', sources: [{ source: { type: 'container', space: 'mySpace', externalId: 'myContainer' }, properties: ['*'] }] })
   *   .autoPagingToArray({ limit: 10000 });
   *
   * // Iterate with for-await
   * for await (const record of client.records.sync('my_stream', { initializeCursor: '1d-ago' })) {
   *   console.log(record);
   * }
   * ```
   */
  public sync = (
    streamExternalId: string,
    request: RecordSyncRequest
  ): CursorAndAsyncIterator<SyncRecordItem> => {
    const path = this.url(`${streamExternalId}/records/sync`);

    const callSyncEndpoint = async (params?: RecordSyncRequest) => {
      const response = await this.post<RecordSyncResponse>(path, {
        data: params,
      });
      const items = this.addToMapAndReturn(response.data.items, response);
      // Map hasNext to nextCursor for the pagination mechanism
      const nextCursor = response.data.hasNext
        ? response.data.nextCursor
        : undefined;
      return { ...response, data: { items, nextCursor } };
    };

    return this.cursorBasedEndpoint<RecordSyncRequest, SyncRecordItem>(
      callSyncEndpoint,
      request
    );
  };
}
