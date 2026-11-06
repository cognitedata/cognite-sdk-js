// Copyright 2026 Cognite AS

import type {
  CursorAndAsyncIterator,
  ExternalId,
  FilterQuery,
} from '@cognite/sdk-core';
import type { IgnoreUnknownIds } from '../../types';
import type { HostedExtractorDeleteParams } from './commonTypes';
import { HostedExtractorResourceAPI } from './hostedExtractorResourceApi';
import type {
  HostedExtractorSource,
  HostedExtractorSourceChange,
  HostedExtractorSourceCreate,
} from './sourcesTypes';

export class HostedExtractorSourcesAPI extends HostedExtractorResourceAPI<HostedExtractorSource> {
  /**
   * [Create sources](https://api-docs.cognite.com/20230101/tag/Sources/operation/create_sources)
   *
   * ```js
   * const sources = await client.hostedExtractors.sources.create([
   *   {
   *     type: 'mqtt5',
   *     externalId: 'my-mqtt-broker',
   *     host: 'mqtt.example.com',
   *     authentication: { type: 'basic', username: 'user', password: 'secret' },
   *   },
   * ]);
   * ```
   */
  public create = (
    items: HostedExtractorSourceCreate[]
  ): Promise<HostedExtractorSource[]> => {
    return this.createInChunks(items);
  };

  /**
   * [List sources](https://api-docs.cognite.com/20230101/tag/Sources/operation/list_sources)
   *
   * ```js
   * const sources = await client.hostedExtractors.sources
   *   .list()
   *   .autoPagingToArray({ limit: Infinity });
   * ```
   */
  public list = (
    query?: FilterQuery
  ): CursorAndAsyncIterator<HostedExtractorSource> => {
    return this.listEndpoint(this.callListEndpointWithGet, query);
  };

  /**
   * [Retrieve sources](https://api-docs.cognite.com/20230101/tag/Sources/operation/retrieve_sources)
   *
   * ```js
   * const sources = await client.hostedExtractors.sources.retrieve([
   *   { externalId: 'my-mqtt-broker' },
   * ]);
   * ```
   */
  public retrieve = (
    ids: ExternalId[],
    params: IgnoreUnknownIds = {}
  ): Promise<HostedExtractorSource[]> => {
    return this.retrieveInChunks(ids, params);
  };

  /**
   * [Update sources](https://api-docs.cognite.com/20230101/tag/Sources/operation/update_sources)
   *
   * ```js
   * const sources = await client.hostedExtractors.sources.update([
   *   {
   *     type: 'mqtt5',
   *     externalId: 'my-mqtt-broker',
   *     update: { host: { set: 'mqtt2.example.com' }, port: { setNull: true } },
   *   },
   * ]);
   * ```
   */
  public update = (
    changes: HostedExtractorSourceChange[]
  ): Promise<HostedExtractorSource[]> => {
    return this.updateInChunks(changes);
  };

  /**
   * [Delete sources](https://api-docs.cognite.com/20230101/tag/Sources/operation/delete_sources)
   *
   * ```js
   * await client.hostedExtractors.sources.delete(
   *   [{ externalId: 'my-mqtt-broker' }],
   *   { ignoreUnknownIds: true, force: true }
   * );
   * ```
   */
  public delete = (
    ids: ExternalId[],
    params: HostedExtractorDeleteParams = {}
  ): Promise<object> => {
    return this.deleteInChunks(ids, params);
  };
}
