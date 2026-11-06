// Copyright 2026 Cognite AS

import {
  BaseResourceAPI,
  type CogniteExternalId,
  type CursorAndAsyncIterator,
  type CursorResponse,
  type ItemsWrapper,
  promiseAllWithData,
} from '@cognite/sdk-core';
import type { IgnoreUnknownIds } from '../../types';
import type {
  WorkflowVersion,
  WorkflowVersionFilterQuery,
  WorkflowVersionId,
  WorkflowVersionUpsert,
  WorkflowVersionUpsertResponse,
} from './types';

export class WorkflowVersionsAPI extends BaseResourceAPI<WorkflowVersion> {
  /**
   * [Create or update a workflow version](https://api-docs.cognite.com/20230101/tag/Workflow-versions/operation/CreateOrUpdateWorkflowVersion)
   *
   * The API accepts one workflow version per request, so the SDK sends one
   * request per item, in sequence.
   *
   * ```js
   * const versions = await client.workflows.versions.upsert([
   *   {
   *     workflowExternalId: 'my-workflow',
   *     version: '1',
   *     workflowDefinition: {
   *       tasks: [
   *         {
   *           externalId: 'task-1',
   *           type: 'function',
   *           parameters: { function: { externalId: 'my-function' } },
   *         },
   *       ],
   *     },
   *   },
   * ]);
   * ```
   */
  public upsert = (
    items: WorkflowVersionUpsert[]
  ): Promise<WorkflowVersionUpsertResponse[]> => {
    return this.callEndpointWithMergeAndTransform(items, (data) =>
      promiseAllWithData(
        data,
        (item) =>
          this.post<ItemsWrapper<WorkflowVersionUpsertResponse[]>>(
            this.url('versions'),
            { data: { items: [item] } }
          ),
        true
      )
    );
  };

  /**
   * [Filter workflow versions](https://api-docs.cognite.com/20230101/tag/Workflow-versions/operation/ListWorkflowVersions)
   *
   * ```js
   * const versions = await client.workflows.versions
   *   .list({ filter: { workflowFilters: [{ externalId: 'my-workflow' }] } })
   *   .autoPagingToArray({ limit: 100 });
   * ```
   */
  public list = (
    query?: WorkflowVersionFilterQuery
  ): CursorAndAsyncIterator<WorkflowVersion> => {
    const path = this.url('versions/list');
    return this.listEndpoint(
      (data) =>
        this.post<CursorResponse<WorkflowVersion[]>>(path, {
          data: data ?? {},
        }),
      query
    );
  };

  /**
   * [Retrieve a workflow version](https://api-docs.cognite.com/20230101/tag/Workflow-versions/operation/GetSpecificVersion)
   *
   * ```js
   * const version = await client.workflows.versions.retrieve('my-workflow', '1');
   * ```
   */
  public retrieve = async (
    workflowExternalId: CogniteExternalId,
    version: string
  ): Promise<WorkflowVersion> => {
    const response = await this.get<WorkflowVersion>(
      this.url(
        `${encodeURIComponent(workflowExternalId)}/versions/${encodeURIComponent(version)}`
      )
    );
    return this.addToMapAndReturn(response.data, response);
  };

  /**
   * [Delete workflow versions](https://api-docs.cognite.com/20230101/tag/Workflow-versions/operation/DeleteSpecificVersionsOfWorkflow)
   *
   * ```js
   * await client.workflows.versions.delete([
   *   { workflowExternalId: 'my-workflow', version: '1' },
   * ]);
   * ```
   */
  public delete = async (
    ids: WorkflowVersionId[],
    params?: IgnoreUnknownIds
  ): Promise<object> => {
    const responses = await this.postInParallelWithAutomaticChunking({
      path: this.url('versions/delete'),
      items: ids,
      queryParams: params,
      chunkSize: 100,
    });
    return this.addToMapAndReturn({}, responses[0]);
  };
}
