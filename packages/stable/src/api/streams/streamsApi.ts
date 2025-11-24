// Copyright 2025 Cognite AS

import { BaseResourceAPI } from '@cognite/sdk-core';
import type { Stream, StreamRetrieveParams, StreamWrite } from '../../types';

export class StreamsAPI extends BaseResourceAPI<Stream> {
  /**
   * @hidden
   */
  protected getDateProps() {
    return this.pickDateProps(['items'], ['createdTime', 'lastUpdatedTime']);
  }

  /**
   * [Create stream](https://developer.cognite.com/api#tag/Streams/operation/createStream)
   *
   * ```js
   * const stream = await client.streams.create({
   *   externalId: 'my_stream',
   *   settings: {
   *     template: {
   *       name: 'ImmutableTestStream'
   *     }
   *   }
   * });
   * ```
   */
  public create = async (item: StreamWrite): Promise<Stream> => {
    const path = this.url();
    const response = await this.post<{ items: Stream[] }>(path, {
      data: { items: [item] },
    });
    return this.addToMapAndReturn(response.data.items[0], response);
  };

  /**
   * [List streams](https://developer.cognite.com/api#tag/Streams/operation/listStreams)
   *
   * ```js
   * const streams = await client.streams.list();
   * ```
   */
  public list = async (): Promise<Stream[]> => {
    const path = this.url();
    const response = await this.get<{ items: Stream[] }>(path);
    return this.addToMapAndReturn(response.data.items, response);
  };

  /**
   * [Retrieve a stream](https://developer.cognite.com/api#tag/Streams/operation/getStream)
   *
   * ```js
   * const stream = await client.streams.retrieve({
   *   externalId: 'my_stream',
   *   includeStatistics: true
   * });
   * ```
   */
  public retrieve = async (params: StreamRetrieveParams): Promise<Stream> => {
    const { externalId, includeStatistics } = params;
    const path = this.url(externalId);
    const response = await this.get<Stream>(path, {
      params: includeStatistics ? { includeStatistics: 'true' } : {},
    });
    return this.addToMapAndReturn(response.data, response);
  };

  /**
   * [Delete a stream](https://developer.cognite.com/api#tag/Streams/operation/deleteStreams)
   *
   * Deletes a stream by its identifier, along with all records stored in the stream.
   * If the stream does not exist, the operation succeeds without error (idempotent delete).
   *
   * ```js
   * await client.streams.delete('my_stream');
   * ```
   */
  public delete = async (externalId: string): Promise<void> => {
    const path = this.url('delete');
    await this.post<object>(path, {
      data: { items: [{ externalId }] },
    });
  };
}
