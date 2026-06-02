// Copyright 2026 Cognite AS

import { BaseResourceAPI } from '@cognite/sdk-core';
import type {
  CogniteExternalId,
  CursorAndAsyncIterator,
  FilterQuery,
} from '@cognite/sdk-core';
import type { Workflow, WorkflowExternalId, WorkflowUpsert } from './types';

export class WorkflowsAPI extends BaseResourceAPI<Workflow> {
  /**
   * [List workflows](https://api-docs.cognite.com/20230101-alpha/tag/Workflows/operation/FetchAllWorkflows)
   *
   * ```js
   * const workflows = await client.workflows.list({ limit: 10 });
   * ```
   */
  public list = (query?: FilterQuery): CursorAndAsyncIterator<Workflow> => {
    return this.listEndpoint(this.callListEndpointWithGet, query);
  };

  /**
   * [Retrieve a workflow by external id](https://api-docs.cognite.com/20230101/tag/Workflows/operation/fetchWorkflowDetails)
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
   * [Create or update a workflow](https://api-docs.cognite.com/20230101-alpha/tag/Workflows/operation/CreateOrUpdateWorkflow)
   *
   * ```js
   * const workflows = await client.workflows.upsert([
   *   { externalId: 'my-workflow', description: 'Demo', maxConcurrentExecutions: 2 },
   * ]);
   * ```
   */
  public upsert = (items: WorkflowUpsert[]): Promise<Workflow[]> => {
    return this.createEndpoint(items, this.url());
  };

  /**
   * [Delete workflows](https://api-docs.cognite.com/20230101-alpha/tag/Workflows/operation/DeleteWorkflows)
   *
   * ```js
   * await client.workflows.delete([{ externalId: 'my-workflow' }]);
   * ```
   */
  public delete = (ids: WorkflowExternalId[]) => {
    return this.deleteEndpoint(ids);
  };
}
