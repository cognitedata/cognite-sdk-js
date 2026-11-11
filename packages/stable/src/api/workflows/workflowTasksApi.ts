// Copyright 2026 Cognite AS

import { BaseResourceAPI } from '@cognite/sdk-core';
import type {
  WorkflowTaskExecution,
  WorkflowTaskExecutionId,
  WorkflowTaskUpdate,
} from './types';

export class WorkflowTasksAPI extends BaseResourceAPI<WorkflowTaskExecution> {
  /**
   * [Update task status](https://api-docs.cognite.com/20230101/tag/Tasks/operation/UpdateTaskStatus)
   *
   * Completes or fails a task that runs asynchronously, such as a function
   * task with `isAsyncComplete: true`.
   *
   * ```js
   * const task = await client.workflows.tasks.update('task-execution-id', {
   *   status: 'COMPLETED',
   *   output: { myKey: 'myValue' },
   * });
   * ```
   */
  public update = async (
    taskId: WorkflowTaskExecutionId,
    request: WorkflowTaskUpdate
  ): Promise<WorkflowTaskExecution> => {
    const response = await this.post<WorkflowTaskExecution>(
      this.url(`tasks/${encodeURIComponent(taskId)}/update`),
      { data: request }
    );
    return this.addToMapAndReturn(response.data, response);
  };
}
