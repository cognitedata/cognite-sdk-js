// Copyright 2026 Cognite AS

import {
  BaseResourceAPI,
  type CursorAndAsyncIterator,
  type CursorResponse,
  type IdEither,
} from '@cognite/sdk-core';
import type { IgnoreUnknownIds } from '../../types';
import type {
  Transformation,
  TransformationChange,
  TransformationCreate,
  TransformationFilterQuery,
  TransformationJob,
  TransformationListQuery,
  TransformationRetrieveParams,
  TransformationRunRequest,
} from './types';

export class TransformationsAPI extends BaseResourceAPI<Transformation> {
  /**
   * [Create transformations](https://api-docs.cognite.com/20230101/tag/Transformations/operation/createTransformations)
   *
   * ```js
   * const transformations = await client.transformations.create([
   *   {
   *     externalId: 'my-transformation',
   *     name: 'My transformation',
   *     ignoreNullFields: true,
   *     query: 'select * from `db`.`table`',
   *     destination: { type: 'assets' },
   *     conflictMode: 'upsert',
   *   },
   * ]);
   * ```
   */
  public create = (
    items: TransformationCreate[]
  ): Promise<Transformation[]> => {
    return this.createEndpoint(items);
  };

  /**
   * [List transformations](https://api-docs.cognite.com/20230101/tag/Transformations/operation/getTransformations)
   *
   * ```js
   * const transformations = await client.transformations
   *   .list({ includePublic: true })
   *   .autoPagingToArray({ limit: 100 });
   * ```
   */
  public list = (
    query?: TransformationListQuery
  ): CursorAndAsyncIterator<Transformation> => {
    return this.listEndpoint(this.callListEndpointWithGet, query);
  };

  /**
   * [Filter transformations](https://api-docs.cognite.com/20230101/tag/Transformations/operation/filterTransformations)
   *
   * ```js
   * const transformations = await client.transformations
   *   .filter({ filter: { destinationType: 'assets', isPublic: true } })
   *   .autoPagingToArray({ limit: 100 });
   * ```
   */
  public filter = (
    query: TransformationFilterQuery
  ): CursorAndAsyncIterator<Transformation> => {
    const path = this.url('filter');
    return this.listEndpoint(
      (data) => this.post<CursorResponse<Transformation[]>>(path, { data }),
      query
    );
  };

  /**
   * [Retrieve transformations](https://api-docs.cognite.com/20230101/tag/Transformations/operation/getTransformationsByIds)
   *
   * ```js
   * const transformations = await client.transformations.retrieve(
   *   [{ id: 123 }, { externalId: 'my-transformation' }],
   *   { withJobDetails: false }
   * );
   * ```
   */
  public retrieve = (
    ids: IdEither[],
    params: TransformationRetrieveParams = {}
  ): Promise<Transformation[]> => {
    return this.retrieveEndpoint(ids, { withJobDetails: true, ...params });
  };

  /**
   * [Update transformations](https://api-docs.cognite.com/20230101/tag/Transformations/operation/updateTransformations)
   *
   * ```js
   * const transformations = await client.transformations.update([
   *   {
   *     externalId: 'my-transformation',
   *     update: { query: { set: 'select * from `db`.`other_table`' } },
   *   },
   * ]);
   * ```
   */
  public update = (
    changes: TransformationChange[]
  ): Promise<Transformation[]> => {
    return this.updateEndpoint(changes);
  };

  /**
   * [Delete transformations](https://api-docs.cognite.com/20230101/tag/Transformations/operation/deleteTransformations)
   *
   * ```js
   * await client.transformations.delete([{ id: 123 }, { externalId: 'my-transformation' }]);
   * ```
   */
  public delete = (ids: IdEither[], params: IgnoreUnknownIds = {}) => {
    return this.deleteEndpoint(ids, params);
  };

  /**
   * [Run a transformation](https://api-docs.cognite.com/20230101/tag/Transformations/operation/runTransformation)
   *
   * Starts a job for the transformation and returns it.
   *
   * ```js
   * const job = await client.transformations.run({ externalId: 'my-transformation' });
   * ```
   */
  public run = async (
    request: TransformationRunRequest
  ): Promise<TransformationJob> => {
    const response = await this.post<TransformationJob>(this.url('run'), {
      data: request,
    });
    return this.addToMapAndReturn(response.data, response);
  };

  /**
   * [Cancel a transformation](https://api-docs.cognite.com/20230101/tag/Transformations/operation/postApiV1ProjectsProjectTransformationsCancel)
   *
   * Cancels the running job of the transformation.
   *
   * ```js
   * await client.transformations.cancel({ externalId: 'my-transformation' });
   * ```
   */
  public cancel = async (id: IdEither): Promise<object> => {
    const response = await this.post<object>(this.url('cancel'), {
      data: id,
    });
    return this.addToMapAndReturn(response.data, response);
  };
}
