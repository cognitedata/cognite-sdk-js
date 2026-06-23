// Copyright 2026 Cognite AS

import { BaseResourceAPI } from '@cognite/sdk-core';
import type {
  CDFHttpClient,
  CogniteExternalId,
  CursorAndAsyncIterator,
  MetadataMap,
} from '@cognite/sdk-core';
import type {
  WorkflowExecution,
  WorkflowExecutionCancelRequest,
  WorkflowExecutionDetails,
  WorkflowExecutionFilterQuery,
  WorkflowExecutionRetryRequest,
  WorkflowExecutionRunRequest,
} from './types';

export class WorkflowExecutionsAPI extends BaseResourceAPI<WorkflowExecution> {
  private readonly workflowsPath: string;

  constructor(
    executionsPath: string,
    workflowsPath: string,
    httpClient: CDFHttpClient,
    map: MetadataMap
  ) {
    super(executionsPath, httpClient, map);
    this.workflowsPath = workflowsPath;
  }

  /**
   * [List workflow executions](https://api-docs.cognite.com/20230101-alpha/tag/Workflow-executions/operation/FilterWorkflowExecutions)
   *
   * ```js
   * const executions = await client.workflowExecutions.list({ limit: 10 });
   * ```
   */
  public list = (
    query?: WorkflowExecutionFilterQuery
  ): CursorAndAsyncIterator<WorkflowExecution> => {
    return this.listEndpoint(this.callListEndpointWithPost, query);
  };

  /**
   * [Retrieve workflow execution details](https://api-docs.cognite.com/20230101-alpha/tag/Workflow-executions/operation/RetrieveWorkflowExecutionDetails)
   *
   * ```js
   * const execution = await client.workflowExecutions.retrieve('execution-id');
   * ```
   */
  public retrieve = async (
    executionId: string
  ): Promise<WorkflowExecutionDetails> => {
    const response = await this.get<WorkflowExecutionDetails>(
      this.url(encodeURIComponent(executionId))
    );
    return this.addToMapAndReturn(response.data, response);
  };

  /**
   * [Run a workflow](https://api-docs.cognite.com/20230101-alpha/tag/Workflow-executions/operation/RunWorkflow)
   *
   * ```js
   * const execution = await client.workflowExecutions.run('my-workflow', '1', {
   *   authentication: { nonce: 'session-nonce' },
   * });
   * ```
   */
  public run = (
    workflowExternalId: CogniteExternalId,
    version: string,
    request: WorkflowExecutionRunRequest
  ): Promise<WorkflowExecution> => {
    const path = `${this.workflowsPath}/${encodeURIComponent(workflowExternalId)}/versions/${encodeURIComponent(version)}/run`;
    return this.createExecutionEndpoint(request, path);
  };

  /**
   * [Retry workflow execution](https://api-docs.cognite.com/20230101-alpha/tag/Workflow-executions/operation/RetryWorkflowExecution)
   *
   * ```js
   * const execution = await client.workflowExecutions.retry('execution-id', {
   *   authentication: { nonce: 'session-nonce' },
   * });
   * ```
   */
  public retry = (
    executionId: string,
    request: WorkflowExecutionRetryRequest
  ): Promise<WorkflowExecution> => {
    return this.createExecutionEndpoint(
      request,
      this.url(`${encodeURIComponent(executionId)}/retry`)
    );
  };

  /**
   * [Cancel workflow execution](https://api-docs.cognite.com/20230101-alpha/tag/Workflow-executions/operation/CancelWorkflowExecution)
   *
   * ```js
   * const execution = await client.workflowExecutions.cancel('execution-id');
   * ```
   */
  public cancel = (
    executionId: string,
    request?: WorkflowExecutionCancelRequest
  ): Promise<WorkflowExecution> => {
    return this.createExecutionEndpoint(
      request ?? {},
      this.url(`${encodeURIComponent(executionId)}/cancel`)
    );
  };

  private createExecutionEndpoint<RequestType>(
    request: RequestType,
    path: string
  ): Promise<WorkflowExecution> {
    return this.post<WorkflowExecution>(path, { data: request }).then(
      (response) => this.addToMapAndReturn(response.data, response)
    );
  }
}
