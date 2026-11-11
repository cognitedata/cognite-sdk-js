// Copyright 2026 Cognite AS

import { WorkflowsAPI as WorkflowsAPIStable } from '@cognite/sdk';
import type {
  CogniteExternalId,
  CursorAndAsyncIterator,
  FilterQuery,
} from '@cognite/sdk-core';
import type { Workflow, WorkflowUpsert } from './types';

/**
 * The stable workflows API, with the alpha-only fields `dataDomainExternalId`
 * and `isDataAware` added to its types.
 */
export class WorkflowsAPI extends WorkflowsAPIStable {
  /**
   * [Create or update a workflow](https://api-docs.cognite.com/20230101-alpha/tag/Workflows/operation/CreateOrUpdateWorkflow)
   *
   * ```js
   * const workflows = await client.workflows.upsert([
   *   {
   *     externalId: 'my-workflow',
   *     description: 'Demo',
   *     maxConcurrentExecutions: 2,
   *     dataDomainExternalId: 'my-data-domain',
   *     isDataAware: true,
   *   },
   * ]);
   * ```
   */
  public declare upsert: (items: WorkflowUpsert[]) => Promise<Workflow[]>;

  /**
   * [List workflows](https://api-docs.cognite.com/20230101-alpha/tag/Workflows/operation/FetchAllWorkflows)
   *
   * ```js
   * const workflows = await client.workflows.list({ limit: 10 });
   * ```
   */
  public declare list: (
    query?: FilterQuery
  ) => CursorAndAsyncIterator<Workflow>;

  /**
   * [Retrieve a workflow](https://api-docs.cognite.com/20230101-alpha/tag/Workflows/operation/fetchWorkflowDetails)
   *
   * ```js
   * const workflow = await client.workflows.retrieve('my-workflow');
   * ```
   */
  public declare retrieve: (externalId: CogniteExternalId) => Promise<Workflow>;
}
