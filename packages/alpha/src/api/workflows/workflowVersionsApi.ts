// Copyright 2026 Cognite AS

import { BaseResourceAPI } from '@cognite/sdk-core';
import type { CursorAndAsyncIterator } from '@cognite/sdk-core';
import type {
  Version,
  VersionDelete,
  VersionUpsert,
  WorkflowVersionFilterQuery,
} from './types';

export class WorkflowVersionsAPI extends BaseResourceAPI<Version> {
  /**
   * [List workflow versions](https://api-docs.cognite.com/20230101-alpha/tag/Workflow-versions/operation/FilterWorkflowVersions)
   *
   * ```js
   * const versions = await client.workflowVersions.list({ limit: 10 });
   * ```
   */
  public list = (
    query?: WorkflowVersionFilterQuery
  ): CursorAndAsyncIterator<Version> => {
    return this.listEndpoint(this.callListEndpointWithPost, query);
  };

  /**
   * [Create or update a workflow version](https://api-docs.cognite.com/20230101-alpha/tag/Workflow-versions/operation/CreateOrUpdateWorkflowVersion)
   *
   * ```js
   * const versions = await client.workflowVersions.upsert([
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
  public upsert = (items: VersionUpsert[]): Promise<Version[]> => {
    return this.createEndpoint(items, this.url());
  };

  /**
   * [Delete workflow versions](https://api-docs.cognite.com/20230101-alpha/tag/Workflow-versions/operation/DeleteWorkflowVersions)
   *
   * ```js
   * await client.workflowVersions.delete([
   *   { workflowExternalId: 'my-workflow', version: '1' },
   * ]);
   * ```
   */
  public delete = (ids: VersionDelete[]) => {
    return this.deleteEndpoint(ids);
  };
}
