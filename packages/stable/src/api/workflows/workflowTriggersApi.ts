// Copyright 2026 Cognite AS

import {
  BaseResourceAPI,
  type CogniteExternalId,
  type CursorAndAsyncIterator,
  type CursorResponse,
  type FilterQuery,
  type ItemsWrapper,
  promiseAllWithData,
} from '@cognite/sdk-core';
import type {
  WorkflowTrigger,
  WorkflowTriggerExternalId,
  WorkflowTriggerRun,
  WorkflowTriggerUpsert,
} from './types';

export class WorkflowTriggersAPI extends BaseResourceAPI<WorkflowTrigger> {
  /**
   * [Create or update triggers](https://api-docs.cognite.com/20230101/tag/Workflow-triggers/operation/CreateOrUpdateTriggers)
   *
   * The API accepts one trigger per request, so the SDK sends one request
   * per item, in sequence.
   *
   * ```js
   * const [session] = await client.sessions.create([
   *   { clientId: 'my-client-id', clientSecret: 'my-client-secret' },
   * ]);
   * const triggers = await client.workflows.triggers.upsert([
   *   {
   *     externalId: 'my-trigger',
   *     triggerRule: { triggerType: 'schedule', cronExpression: '0 * * * *' },
   *     workflowExternalId: 'my-workflow',
   *     workflowVersion: '1',
   *     authentication: { nonce: session.nonce },
   *   },
   * ]);
   * ```
   */
  public upsert = (
    items: WorkflowTriggerUpsert[]
  ): Promise<WorkflowTrigger[]> => {
    return this.callEndpointWithMergeAndTransform(items, (data) =>
      promiseAllWithData(
        data,
        (item) =>
          this.post<ItemsWrapper<WorkflowTrigger[]>>(this.url('triggers'), {
            data: { items: [item] },
          }),
        true
      )
    );
  };

  /**
   * [List triggers](https://api-docs.cognite.com/20230101/tag/Workflow-triggers/operation/FetchAllTriggers)
   *
   * ```js
   * const triggers = await client.workflows.triggers
   *   .list()
   *   .autoPagingToArray({ limit: 100 });
   * ```
   */
  public list = (
    query?: FilterQuery
  ): CursorAndAsyncIterator<WorkflowTrigger> => {
    const path = this.url('triggers');
    return this.listEndpoint(
      (params) => this.get<CursorResponse<WorkflowTrigger[]>>(path, { params }),
      query
    );
  };

  /**
   * [Delete triggers](https://api-docs.cognite.com/20230101/tag/Workflow-triggers/operation/deleteTriggers)
   *
   * The API accepts one trigger per request, so the SDK sends one request
   * per item.
   *
   * ```js
   * await client.workflows.triggers.delete([{ externalId: 'my-trigger' }]);
   * ```
   */
  public delete = async (ids: WorkflowTriggerExternalId[]): Promise<object> => {
    const responses = await this.postInParallelWithAutomaticChunking({
      path: this.url('triggers/delete'),
      items: ids,
      chunkSize: 1,
    });
    return this.addToMapAndReturn({}, responses[0]);
  };

  /**
   * [Get the run history of a trigger](https://api-docs.cognite.com/20230101/tag/Workflow-triggers/operation/getTriggerHistory)
   *
   * Newest runs first.
   *
   * ```js
   * const runs = await client.workflows.triggers
   *   .listRuns('my-trigger')
   *   .autoPagingToArray({ limit: 100 });
   * ```
   */
  public listRuns = (
    externalId: CogniteExternalId,
    query?: FilterQuery
  ): CursorAndAsyncIterator<WorkflowTriggerRun> => {
    const path = this.url(`triggers/${encodeURIComponent(externalId)}/history`);
    return this.cursorBasedEndpoint<FilterQuery, WorkflowTriggerRun>(
      (params) =>
        this.get<CursorResponse<WorkflowTriggerRun[]>>(path, { params }),
      query
    );
  };

  /**
   * [Pause a trigger](https://api-docs.cognite.com/20230101/tag/Workflow-triggers/operation/pauseTrigger)
   *
   * A paused trigger does not fire until it is resumed.
   *
   * ```js
   * await client.workflows.triggers.pause('my-trigger');
   * ```
   */
  public pause = async (externalId: CogniteExternalId): Promise<object> => {
    const response = await this.post<object>(
      this.url(`triggers/${encodeURIComponent(externalId)}/pause`)
    );
    return this.addToMapAndReturn(response.data, response);
  };

  /**
   * [Resume a trigger](https://api-docs.cognite.com/20230101/tag/Workflow-triggers/operation/resumeTrigger)
   *
   * ```js
   * await client.workflows.triggers.resume('my-trigger');
   * ```
   */
  public resume = async (externalId: CogniteExternalId): Promise<object> => {
    const response = await this.post<object>(
      this.url(`triggers/${encodeURIComponent(externalId)}/resume`)
    );
    return this.addToMapAndReturn(response.data, response);
  };
}
