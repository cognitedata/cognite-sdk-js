// Copyright 2026 Cognite AS

import {
  BaseResourceAPI,
  type CogniteExternalId,
  type CursorAndAsyncIterator,
  type FilterQuery,
  type ItemsWrapper,
  promiseAllWithData,
} from '@cognite/sdk-core';
import type { IgnoreUnknownIds } from '../../types';
import type { Workflow, WorkflowExternalId, WorkflowUpsert } from './types';

export class WorkflowsAPI extends BaseResourceAPI<Workflow> {
  /**
   * [Create or update a workflow](https://api-docs.cognite.com/20230101/tag/Workflows/operation/CreateOrUpdateWorkflow)
   *
   * The API accepts one workflow per request, so the SDK sends one request
   * per item, in sequence.
   *
   * ```js
   * const workflows = await client.workflows.upsert([
   *   {
   *     externalId: 'my-workflow',
   *     description: 'My workflow',
   *     maxConcurrentExecutions: 2,
   *   },
   * ]);
   * ```
   */
  public upsert = (items: WorkflowUpsert[]): Promise<Workflow[]> => {
    return this.callEndpointWithMergeAndTransform(items, (data) =>
      promiseAllWithData(
        data,
        (item) =>
          this.post<ItemsWrapper<Workflow[]>>(this.url(), {
            data: { items: [item] },
          }),
        true
      )
    );
  };

  /**
   * [List workflows](https://api-docs.cognite.com/20230101/tag/Workflows/operation/FetchAllWorkflows)
   *
   * ```js
   * const workflows = await client.workflows.list().autoPagingToArray({ limit: 100 });
   * ```
   */
  public list = (query?: FilterQuery): CursorAndAsyncIterator<Workflow> => {
    return this.listEndpoint(this.callListEndpointWithGet, query);
  };

  /**
   * [Retrieve a workflow](https://api-docs.cognite.com/20230101/tag/Workflows/operation/fetchWorkflowDetails)
   *
   * ```js
   * const workflow = await client.workflows.retrieve('my-workflow');
   * ```
   */
  public retrieve = async (
    externalId: CogniteExternalId
  ): Promise<Workflow> => {
    const response = await this.get<Workflow>(
      this.url(encodeURIComponent(externalId))
    );
    return this.addToMapAndReturn(response.data, response);
  };

  /**
   * [Delete workflows](https://api-docs.cognite.com/20230101/tag/Workflows/operation/DeleteWorkflows)
   *
   * Also deletes all versions of the workflows.
   *
   * ```js
   * await client.workflows.delete([{ externalId: 'my-workflow' }]);
   * ```
   */
  public delete = async (
    ids: WorkflowExternalId[],
    params?: IgnoreUnknownIds
  ): Promise<object> => {
    const responses = await this.postInParallelWithAutomaticChunking({
      path: this.deleteUrl,
      items: ids,
      queryParams: params,
      chunkSize: 100,
    });
    return this.addToMapAndReturn({}, responses[0]);
  };
}
