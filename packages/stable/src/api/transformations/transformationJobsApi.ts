// Copyright 2026 Cognite AS

import {
  BaseResourceAPI,
  type CogniteInternalId,
  type CursorAndAsyncIterator,
  type InternalId,
  type ItemsWrapper,
} from '@cognite/sdk-core';
import type { IgnoreUnknownIds } from '../../types';
import type {
  TransformationJob,
  TransformationJobListQuery,
  TransformationJobMetric,
} from './types';

export class TransformationJobsAPI extends BaseResourceAPI<TransformationJob> {
  /**
   * [List jobs](https://api-docs.cognite.com/20230101/tag/Transformation-Jobs/operation/getTransformationJobs)
   *
   * ```js
   * const jobs = await client.transformations.jobs
   *   .list({ transformationExternalId: 'my-transformation' })
   *   .autoPagingToArray({ limit: 100 });
   * ```
   */
  public list = (
    query?: TransformationJobListQuery
  ): CursorAndAsyncIterator<TransformationJob> => {
    return this.listEndpoint(this.callListEndpointWithGet, query);
  };

  /**
   * [Retrieve jobs by ids](https://api-docs.cognite.com/20230101/tag/Transformation-Jobs/operation/getTransformationJobsByIds)
   *
   * ```js
   * const jobs = await client.transformations.jobs.retrieve([{ id: 123 }]);
   * ```
   */
  public retrieve = (
    ids: InternalId[],
    params: IgnoreUnknownIds = {}
  ): Promise<TransformationJob[]> => {
    return this.retrieveEndpoint(ids, params);
  };

  /**
   * [List job metrics by job id](https://api-docs.cognite.com/20230101/tag/Transformation-Jobs/operation/getTransformationJobsMetrics)
   *
   * ```js
   * const metrics = await client.transformations.jobs.listMetrics(123);
   * ```
   */
  public listMetrics = async (
    jobId: CogniteInternalId
  ): Promise<TransformationJobMetric[]> => {
    const response = await this.get<ItemsWrapper<TransformationJobMetric[]>>(
      this.url(`${encodeURIComponent(jobId)}/metrics`)
    );
    return this.addToMapAndReturn(response.data.items, response);
  };
}
