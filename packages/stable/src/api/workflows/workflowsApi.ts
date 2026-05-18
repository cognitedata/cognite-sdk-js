// Copyright 2026 Cognite AS

import { BaseResourceAPI } from '@cognite/sdk-core';
import type { CogniteExternalId, ItemsWrapper } from '@cognite/sdk-core';
import type {
  Workflow,
  WorkflowExternalId,
  WorkflowList,
  WorkflowListQuery,
  WorkflowUpsert,
} from './types';

export class WorkflowsAPI extends BaseResourceAPI<Workflow> {
  /**
   * [List workflows](https://developer.cognite.com/api#tag/Workflows/operation/ListWorkflows)
   *
   * ```js
   * const { items, nextCursor } = await client.workflows.list();
   * ```
   */
  public list = async (query?: WorkflowListQuery): Promise<WorkflowList> => {
    const response = await this.get<WorkflowList>(this.url(''), {
      params: query,
    });
    return this.addToMapAndReturn(response.data, response);
  };

  /**
   * [Retrieve a workflow by external id](https://developer.cognite.com/api#tag/Workflows/operation/FetchWorkflow)
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
   * [Create or update workflows](https://developer.cognite.com/api#tag/Workflows/operation/CreateOrUpdateWorkflows)
   *
   * ```js
   * const items = await client.workflows.upsert([
   *   { externalId: 'my-workflow-2', description: 'Does things too', maxConcurrentExecutions: 20, dataSetId: 42 },
   * ]);
   * ```
   */
  public upsert = async (items: WorkflowUpsert[]): Promise<ItemsWrapper<Workflow[]>> => {
    const response = await this.post<ItemsWrapper<Workflow[]>>(this.url(''), {
      data: { items },
    });
    return this.addToMapAndReturn(response.data, response);
  };

  /**
   * [Delete workflows](https://developer.cognite.com/api#tag/Workflows/operation/DeleteWorkflows)
   *
   * ```js
   * await client.workflows.delete([{ externalId: 'my-workflow' }]);
   * ```
   */
  public delete = async (items: WorkflowExternalId[]): Promise<object> => {
    const response = await this.post<object>(this.url('delete'), {
      data: { items },
    });
    return this.addToMapAndReturn({}, response);
  };
}
