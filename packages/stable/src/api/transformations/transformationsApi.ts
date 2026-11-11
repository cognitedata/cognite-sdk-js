// Copyright 2026 Cognite AS

import {
  BaseResourceAPI,
  type CDFHttpClient,
  type CursorAndAsyncIterator,
  type CursorResponse,
  type IdEither,
  type MetadataMap,
} from '@cognite/sdk-core';
import { assertExperimentalEnabled } from '../../experimental';
import type { IgnoreUnknownIds } from '../../types';
import { TransformationJobsAPI } from './transformationJobsApi';
import { TransformationNotificationsAPI } from './transformationNotificationsApi';
import { TransformationQueryAPI } from './transformationQueryApi';
import { TransformationSchedulesAPI } from './transformationSchedulesApi';
import { TransformationSchemaAPI } from './transformationSchemaApi';
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
  private readonly jobsApi: TransformationJobsAPI;
  private readonly notificationsApi: TransformationNotificationsAPI;
  private readonly queryApi: TransformationQueryAPI;
  private readonly schedulesApi: TransformationSchedulesAPI;
  private readonly schemaApi: TransformationSchemaAPI;
  private experimentalEnabled = true;

  /** @hidden */
  constructor(resourcePath: string, ...args: [CDFHttpClient, MetadataMap]) {
    super(resourcePath, ...args);
    this.jobsApi = new TransformationJobsAPI(`${resourcePath}/jobs`, ...args);
    this.notificationsApi = new TransformationNotificationsAPI(
      `${resourcePath}/notifications`,
      ...args
    );
    this.queryApi = new TransformationQueryAPI(
      `${resourcePath}/query`,
      ...args
    );
    this.schedulesApi = new TransformationSchedulesAPI(
      `${resourcePath}/schedules`,
      ...args
    );
    this.schemaApi = new TransformationSchemaAPI(
      `${resourcePath}/schema`,
      ...args
    );
  }

  /**
   * Called by `CogniteClient` to apply the `experimental.transformations`
   * option. Directly constructed instances are enabled.
   *
   * @hidden
   */
  public setExperimentalEnabled(enabled: boolean) {
    this.experimentalEnabled = enabled;
  }

  private assertExperimental(subApi: string) {
    assertExperimentalEnabled(
      this.experimentalEnabled,
      'transformations',
      `client.transformations.${subApi}`
    );
  }

  /**
   * [Query](https://api-docs.cognite.com/20230101/tag/Query)
   *
   * @alpha Experimental, requires `experimental: { transformations: true }` in the client options.
   */
  public get query() {
    this.assertExperimental('query');
    return this.queryApi;
  }

  /**
   * [Transformation notifications](https://api-docs.cognite.com/20230101/tag/Transformation-Notifications)
   *
   * @alpha Experimental, requires `experimental: { transformations: true }` in the client options.
   */
  public get notifications() {
    this.assertExperimental('notifications');
    return this.notificationsApi;
  }

  /**
   * [Transformation schedules](https://api-docs.cognite.com/20230101/tag/Transformation-Schedules)
   *
   * @alpha Experimental, requires `experimental: { transformations: true }` in the client options.
   */
  public get schedules() {
    this.assertExperimental('schedules');
    return this.schedulesApi;
  }

  /**
   * [Transformation jobs](https://api-docs.cognite.com/20230101/tag/Transformation-Jobs)
   *
   * @alpha Experimental, requires `experimental: { transformations: true }` in the client options.
   */
  public get jobs() {
    this.assertExperimental('jobs');
    return this.jobsApi;
  }

  /**
   * [Transformation schema](https://api-docs.cognite.com/20230101/tag/Schema)
   *
   * @alpha Experimental, requires `experimental: { transformations: true }` in the client options.
   */
  public get schema() {
    this.assertExperimental('schema');
    return this.schemaApi;
  }

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
    return this.retrieveEndpoint(ids, {
      ...params,
      withJobDetails: params.withJobDetails ?? true,
    });
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
