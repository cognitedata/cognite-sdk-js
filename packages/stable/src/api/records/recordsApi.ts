// Copyright 2025 Cognite AS

import type { CursorAndAsyncIterator } from '@cognite/sdk-core';
import { BaseResourceAPI } from '@cognite/sdk-core';
import type {
  RecordAggregateRequest,
  RecordAggregateResponse,
  RecordAggregateResults,
  RecordDelete,
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
    const path = this.url(`${encodeURIComponent(streamExternalId)}/records`);
    await this.post<object>(path, {
      data: { items },
    });
  };

  /**
   * [Upsert records into a stream](https://developer.cognite.com/api#tag/Records/operation/upsertRecords)
   *
   * Create or update records in a mutable stream. If a record with the same
   * space + externalId already exists, it will be fully replaced (no partial updates).
   *
   * **Note:** This endpoint is only available for mutable streams.
   *
   * ```js
   * await client.records.upsert('my_mutable_stream', [
   *   {
   *     space: 'mySpace',
   *     externalId: 'record1',
   *     sources: [
   *       {
   *         source: { type: 'container', space: 'mySpace', externalId: 'myContainer' },
   *         properties: { temperature: 30.0, timestamp: '2025-01-01T00:00:00Z' }
   *       }
   *     ]
   *   }
   * ]);
   * ```
   */
  public upsert = async (
    streamExternalId: string,
    items: RecordWrite[]
  ): Promise<void> => {
    const path = this.url(
      `${encodeURIComponent(streamExternalId)}/records/upsert`
    );
    await this.post<object>(path, {
      data: { items },
    });
  };

  /**
   * [Delete records from a stream](https://developer.cognite.com/api#tag/Records/operation/deleteRecords)
   *
   * Delete records from a mutable stream. The operation is idempotent - deleting
   * non-existent records will not cause an error.
   *
   * **Note:** This endpoint is only available for mutable streams.
   *
   * ```js
   * await client.records.delete('my_mutable_stream', [
   *   { space: 'mySpace', externalId: 'record1' },
   *   { space: 'mySpace', externalId: 'record2' }
   * ]);
   * ```
   */
  public delete = async (
    streamExternalId: string,
    items: RecordDelete[]
  ): Promise<void> => {
    const path = this.url(
      `${encodeURIComponent(streamExternalId)}/records/delete`
    );
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
    const path = this.url(
      `${encodeURIComponent(streamExternalId)}/records/filter`
    );
    const response = await this.post<RecordFilterResponse>(path, {
      data: request,
    });
    return this.addToMapAndReturn(response.data.items, response);
  };

  /**
   * [Sync records from a stream](https://developer.cognite.com/api#tag/Records/operation/syncRecords)
   *
   * Sync records from a stream using a cursor-based approach. Supports both
   * auto-pagination and manual pagination.
   *
   * ```js
   * // Get first page with items, nextCursor, and hasNext
   * const response = await client.records.sync('my_stream', {
   *   initializeCursor: '1d-ago',
   *   sources: [{ source: { type: 'container', space: 'mySpace', externalId: 'myContainer' }, properties: ['*'] }],
   * });
   * console.log(response.items, response.nextCursor, response.hasNext);
   * ```
   */
  public sync = (
    streamExternalId: string,
    request: RecordSyncRequest
  ): CursorAndAsyncIterator<SyncRecordItem> => {
    const path = this.url(
      `${encodeURIComponent(streamExternalId)}/records/sync`
    );

    const callSyncEndpoint = async (params?: RecordSyncRequest) => {
      // When using cursor for pagination, remove initializeCursor
      let requestData = params;
      if (params?.cursor && params?.initializeCursor) {
        const { initializeCursor: _, ...rest } = params;
        requestData = rest;
      }
      const response = await this.post<RecordSyncResponse>(path, {
        data: requestData,
      });
      const items = this.addToMapAndReturn(response.data.items, response);

      return {
        ...response,
        data: {
          items,
          nextCursor: response.data.nextCursor,
          hasNext: response.data.hasNext,
        },
      };
    };

    return this.cursorBasedEndpoint<RecordSyncRequest, SyncRecordItem>(
      callSyncEndpoint,
      request
    );
  };

  /**
   * [Aggregate records from a stream](https://developer.cognite.com/api#tag/Records/operation/aggregateRecords)
   *
   * Aggregate data for records from a stream.
   *
   * ```js
   * const response = await client.records.aggregate('my_stream', {
   *   aggregates: {
   *     total_count: { count: {} },
   *     by_category: {
   *       uniqueValues: {
   *         property: ['mySpace', 'myContainer', 'category'],
   *         aggregates: { total: { sum: { property: ['mySpace', 'myContainer', 'amount'] } } }
   *       }
   *     }
   *   }
   * });
   * ```
   */
  public aggregate = async (
    streamExternalId: string,
    request: RecordAggregateRequest
  ): Promise<RecordAggregateResults> => {
    const path = this.url(
      `${encodeURIComponent(streamExternalId)}/records/aggregate`
    );
    const response = await this.post<RecordAggregateResponse>(path, {
      data: request,
    });
    return response.data.aggregates;
  };
}
