// Copyright 2026 Cognite AS

import {
  BaseResourceAPI,
  type CogniteExternalId,
  type CursorAndAsyncIterator,
  type CursorResponse,
} from '@cognite/sdk-core';
import type {
  WorkflowExecution,
  WorkflowExecutionCancelRequest,
  WorkflowExecutionDetailed,
  WorkflowExecutionFilterQuery,
  WorkflowExecutionId,
  WorkflowExecutionRetryRequest,
  WorkflowExecutionRunRequest,
} from './types';

export class WorkflowExecutionsAPI extends BaseResourceAPI<WorkflowExecution> {
  /**
   * [Run a workflow](https://api-docs.cognite.com/20230101/tag/Workflow-executions/operation/TriggerRunOfSpecificVersionOfWorkflow)
   *
   * ```js
   * const [session] = await client.sessions.create([{ tokenExchange: true }]);
   * const execution = await client.workflows.executions.run('my-workflow', '1', {
   *   authentication: { nonce: session.nonce },
   *   input: { myKey: 'myValue' },
   * });
   * ```
   */
  public run = async (
    workflowExternalId: CogniteExternalId,
    version: string,
    request: WorkflowExecutionRunRequest
  ): Promise<WorkflowExecution> => {
    const path = this.url(
      `${encodeURIComponent(workflowExternalId)}/versions/${encodeURIComponent(version)}/run`
    );
    return this.postExecution(path, request);
  };

  /**
   * [Filter workflow executions](https://api-docs.cognite.com/20230101/tag/Workflow-executions/operation/ListWorkflowExecutions)
   *
   * ```js
   * const executions = await client.workflows.executions
   *   .list({
   *     filter: {
   *       workflowFilters: [{ externalId: 'my-workflow', version: '1' }],
   *       status: ['FAILED'],
   *     },
   *   })
   *   .autoPagingToArray({ limit: 100 });
   * ```
   */
  public list = (
    query?: WorkflowExecutionFilterQuery
  ): CursorAndAsyncIterator<WorkflowExecution> => {
    const path = this.url('executions/list');
    return this.listEndpoint(
      (data) =>
        this.post<CursorResponse<WorkflowExecution[]>>(path, {
          data: data ?? {},
        }),
      query
    );
  };

  /**
   * [Retrieve workflow execution details](https://api-docs.cognite.com/20230101/tag/Workflow-executions/operation/ExecutionOfSpecificRunOfWorkflow)
   *
   * Returns the execution with its workflow definition, input and executed
   * tasks.
   *
   * ```js
   * const execution = await client.workflows.executions.retrieve('execution-id');
   * ```
   */
  public retrieve = async (
    executionId: WorkflowExecutionId
  ): Promise<WorkflowExecutionDetailed> => {
    const response = await this.get<WorkflowExecutionDetailed>(
      this.url(`executions/${encodeURIComponent(executionId)}`)
    );
    return this.addToMapAndReturn(response.data, response);
  };

  /**
   * [Cancel a workflow execution](https://api-docs.cognite.com/20230101/tag/Workflow-executions/operation/WorkflowExecutionCancellation)
   *
   * ```js
   * const execution = await client.workflows.executions.cancel('execution-id', {
   *   reason: 'Started by mistake',
   * });
   * ```
   */
  public cancel = async (
    executionId: WorkflowExecutionId,
    request: WorkflowExecutionCancelRequest = {}
  ): Promise<WorkflowExecution> => {
    return this.postExecution(
      this.url(`executions/${encodeURIComponent(executionId)}/cancel`),
      request
    );
  };

  /**
   * [Retry workflow execution](https://api-docs.cognite.com/20230101/tag/Workflow-executions/operation/WorkflowExecutionRetry)
   *
   * ```js
   * const [session] = await client.sessions.create([{ tokenExchange: true }]);
   * const execution = await client.workflows.executions.retry('execution-id', {
   *   authentication: { nonce: session.nonce },
   * });
   * ```
   */
  public retry = async (
    executionId: WorkflowExecutionId,
    request: WorkflowExecutionRetryRequest
  ): Promise<WorkflowExecution> => {
    return this.postExecution(
      this.url(`executions/${encodeURIComponent(executionId)}/retry`),
      request
    );
  };

  private postExecution = async (
    path: string,
    data: object
  ): Promise<WorkflowExecution> => {
    const response = await this.post<WorkflowExecution>(path, { data });
    return this.addToMapAndReturn(response.data, response);
  };
}
