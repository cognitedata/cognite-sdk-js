// Copyright 2026 Cognite AS

import type {
  CursorAndAsyncIterator,
  ExternalId,
  FilterQuery,
} from '@cognite/sdk-core';
import type { IgnoreUnknownIds } from '../../types';
import type { HostedExtractorDeleteParams } from './commonTypes';
import type {
  HostedExtractorDestination,
  HostedExtractorDestinationChange,
  HostedExtractorDestinationCreate,
} from './destinationsTypes';
import { HostedExtractorResourceAPI } from './hostedExtractorResourceApi';

export class HostedExtractorDestinationsAPI extends HostedExtractorResourceAPI<HostedExtractorDestination> {
  /**
   * [Create destinations](https://api-docs.cognite.com/20230101/tag/Destinations/operation/create_destinations)
   *
   * ```js
   * const [session] = await client.sessions.create([
   *   { clientId: 'my-client-id', clientSecret: 'my-client-secret' },
   * ]);
   * const destinations = await client.hostedExtractors.destinations.create([
   *   {
   *     externalId: 'my-destination',
   *     credentials: { nonce: session.nonce },
   *     targetDataSetId: 123,
   *   },
   * ]);
   * ```
   */
  public create = (
    items: HostedExtractorDestinationCreate[]
  ): Promise<HostedExtractorDestination[]> => {
    return this.createInChunks(items);
  };

  /**
   * [List destinations](https://api-docs.cognite.com/20230101/tag/Destinations/operation/list_destinations)
   *
   * ```js
   * const destinations = await client.hostedExtractors.destinations
   *   .list()
   *   .autoPagingToArray({ limit: Infinity });
   * ```
   */
  public list = (
    query?: FilterQuery
  ): CursorAndAsyncIterator<HostedExtractorDestination> => {
    return this.listEndpoint(this.callListEndpointWithGet, query);
  };

  /**
   * [Retrieve destinations](https://api-docs.cognite.com/20230101/tag/Destinations/operation/retrieve_destinations)
   *
   * ```js
   * const destinations = await client.hostedExtractors.destinations.retrieve([
   *   { externalId: 'my-destination' },
   * ]);
   * ```
   */
  public retrieve = (
    ids: ExternalId[],
    params: IgnoreUnknownIds = {}
  ): Promise<HostedExtractorDestination[]> => {
    return this.retrieveInChunks(ids, params);
  };

  /**
   * [Update destinations](https://api-docs.cognite.com/20230101/tag/Destinations/operation/update_destinations)
   *
   * ```js
   * const destinations = await client.hostedExtractors.destinations.update([
   *   {
   *     externalId: 'my-destination',
   *     update: { name: { set: 'My destination' }, targetDataSetId: { setNull: true } },
   *   },
   * ]);
   * ```
   */
  public update = (
    changes: HostedExtractorDestinationChange[]
  ): Promise<HostedExtractorDestination[]> => {
    return this.updateInChunks(changes);
  };

  /**
   * [Delete destinations](https://api-docs.cognite.com/20230101/tag/Destinations/operation/delete_destinations)
   *
   * ```js
   * await client.hostedExtractors.destinations.delete(
   *   [{ externalId: 'my-destination' }],
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
