// Copyright 2026 Cognite AS

import {
  BaseResourceAPI,
  type CursorAndAsyncIterator,
  type IdEither,
} from '@cognite/sdk-core';
import type { IgnoreUnknownIds } from '../../types';
import type {
  TransformationSchedule,
  TransformationScheduleChange,
  TransformationScheduleCreate,
  TransformationScheduleListQuery,
} from './types';

export class TransformationSchedulesAPI extends BaseResourceAPI<TransformationSchedule> {
  /**
   * [Schedule transformations](https://api-docs.cognite.com/20230101/tag/Transformation-Schedules/operation/createTransformationSchedules)
   *
   * ```js
   * const schedules = await client.transformations.schedules.create([
   *   { externalId: 'my-transformation', interval: '0 * * * *' },
   * ]);
   * ```
   */
  public create = (
    items: TransformationScheduleCreate[]
  ): Promise<TransformationSchedule[]> => {
    return this.createEndpoint(items);
  };

  /**
   * [List all schedules](https://api-docs.cognite.com/20230101/tag/Transformation-Schedules/operation/getTransformationSchedules)
   *
   * ```js
   * const schedules = await client.transformations.schedules
   *   .list({ includePublic: true })
   *   .autoPagingToArray({ limit: 100 });
   * ```
   */
  public list = (
    query?: TransformationScheduleListQuery
  ): CursorAndAsyncIterator<TransformationSchedule> => {
    return this.listEndpoint(this.callListEndpointWithGet, query);
  };

  /**
   * [Retrieve schedules](https://api-docs.cognite.com/20230101/tag/Transformation-Schedules/operation/getTransformationSchedulesByIds)
   *
   * Takes the IDs or external IDs of the scheduled transformations.
   *
   * ```js
   * const schedules = await client.transformations.schedules.retrieve([
   *   { id: 123 },
   *   { externalId: 'my-transformation' },
   * ]);
   * ```
   */
  public retrieve = (
    ids: IdEither[],
    params: IgnoreUnknownIds = {}
  ): Promise<TransformationSchedule[]> => {
    return this.retrieveEndpoint(ids, params);
  };

  /**
   * [Update schedules](https://api-docs.cognite.com/20230101/tag/Transformation-Schedules/operation/updateTransformationSchedules)
   *
   * ```js
   * const schedules = await client.transformations.schedules.update([
   *   { externalId: 'my-transformation', update: { isPaused: { set: true } } },
   * ]);
   * ```
   */
  public update = (
    changes: TransformationScheduleChange[]
  ): Promise<TransformationSchedule[]> => {
    return this.updateEndpoint(changes);
  };

  /**
   * [Unschedule transformations](https://api-docs.cognite.com/20230101/tag/Transformation-Schedules/operation/deleteTransformationSchedules)
   *
   * ```js
   * await client.transformations.schedules.delete([
   *   { id: 123 },
   *   { externalId: 'my-transformation' },
   * ]);
   * ```
   */
  public delete = (ids: IdEither[], params: IgnoreUnknownIds = {}) => {
    return this.deleteEndpoint(ids, params);
  };
}
