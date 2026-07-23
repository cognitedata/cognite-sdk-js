// Copyright 2026 Cognite AS

import { BaseResourceAPI } from '@cognite/sdk-core';
import type {
  CogniteExternalId,
  CursorAndAsyncIterator,
  CursorResponse,
  FilterQuery,
} from '@cognite/sdk-core';
import type {
  WorkflowTrigger,
  WorkflowTriggerExternalId,
  WorkflowTriggerRun,
  WorkflowTriggerUpsert,
} from './types';

export class WorkflowTriggersAPI extends BaseResourceAPI<WorkflowTrigger> {
  /**
   * [List workflow triggers](https://api-docs.cognite.com/20230101-alpha/tag/Workflow-triggers/operation/ListTriggers)
   *
   * ```js
   * const triggers = await client.workflowTriggers.list({ limit: 10 });
   * ```
   */
  public list = (
    query?: FilterQuery
  ): CursorAndAsyncIterator<WorkflowTrigger> => {
    return this.listEndpoint(this.callListEndpointWithGet, query);
  };

  /**
   * [Create or update workflow triggers](https://api-docs.cognite.com/20230101-alpha/tag/Workflow-triggers/operation/CreateOrUpdateTriggers)
   *
   * ```js
   * const triggers = await client.workflowTriggers.upsert([
   *   {
   *     externalId: 'my-trigger',
   *     triggerRule: { triggerType: 'schedule', cronExpression: '0 * * * *' },
   *     workflowExternalId: 'my-workflow',
   *     workflowVersion: '1',
   *     authentication: { nonce: 'session-nonce' },
   *   },
   * ]);
   * ```
   */
  public upsert = (
    items: WorkflowTriggerUpsert[]
  ): Promise<WorkflowTrigger[]> => {
    return this.createEndpoint(items, this.url());
  };

  /**
   * [Delete workflow triggers](https://api-docs.cognite.com/20230101-alpha/tag/Workflow-triggers/operation/DeleteTriggers)
   *
   * ```js
   * await client.workflowTriggers.delete([{ externalId: 'my-trigger' }]);
   * ```
   */
  public delete = (ids: WorkflowTriggerExternalId[]) => {
    return this.deleteEndpoint(ids);
  };

  /**
   * [Pause a workflow trigger](https://api-docs.cognite.com/20230101-alpha/tag/Workflow-triggers/operation/PauseTrigger)
   *
   * ```js
   * await client.workflowTriggers.pause('my-trigger');
   * ```
   */
  public pause = async (externalId: CogniteExternalId): Promise<void> => {
    await this.post(this.url(`${encodeURIComponent(externalId)}/pause`));
  };

  /**
   * [Resume a workflow trigger](https://api-docs.cognite.com/20230101-alpha/tag/Workflow-triggers/operation/ResumeTrigger)
   *
   * ```js
   * await client.workflowTriggers.resume('my-trigger');
   * ```
   */
  public resume = async (externalId: CogniteExternalId): Promise<void> => {
    await this.post(this.url(`${encodeURIComponent(externalId)}/resume`));
  };

  /**
   * [Get the run history of a workflow trigger](https://api-docs.cognite.com/20230101-alpha/tag/Workflow-triggers/operation/GetTriggerHistory)
   *
   * ```js
   * const runs = await client.workflowTriggers.history('my-trigger', { limit: 10 });
   * ```
   */
  public history = (
    externalId: CogniteExternalId,
    query?: FilterQuery
  ): CursorAndAsyncIterator<WorkflowTriggerRun> => {
    return this.cursorBasedEndpoint<FilterQuery, WorkflowTriggerRun>(
      (scope?: FilterQuery) =>
        this.get<CursorResponse<WorkflowTriggerRun[]>>(
          this.url(`${encodeURIComponent(externalId)}/history`),
          { params: scope }
        ),
      query
    );
  };
}
