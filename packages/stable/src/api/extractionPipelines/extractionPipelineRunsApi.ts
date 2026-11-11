// Copyright 2026 Cognite AS

import {
  BaseResourceAPI,
  type CursorAndAsyncIterator,
} from '@cognite/sdk-core';
import type {
  ExtractionPipelineRun,
  ExtractionPipelineRunCreate,
  ExtractionPipelineRunFilterQuery,
  ExtractionPipelineRunListQuery,
  ExtractionPipelineRunWithExternalId,
} from './runsTypes';

export class ExtractionPipelineRunsAPI extends BaseResourceAPI<ExtractionPipelineRun> {
  /**
   * [Create extraction pipeline runs](https://api-docs.cognite.com/20230101/tag/Extraction-Pipelines-Runs/operation/createRuns)
   *
   * Reports the status of extraction pipelines. The API currently accepts one run per request.
   *
   * ```js
   * const runs = await client.extractionPipelines.runs.create([
   *   { externalId: 'my-pipeline', status: 'success' },
   * ]);
   * ```
   */
  public create = (
    items: ExtractionPipelineRunCreate[]
  ): Promise<ExtractionPipelineRunWithExternalId[]> => {
    return this.createEndpoint(items) as Promise<
      ExtractionPipelineRunWithExternalId[]
    >;
  };

  /**
   * [List extraction pipeline runs](https://api-docs.cognite.com/20230101/tag/Extraction-Pipelines-Runs/operation/runs)
   *
   * Runs are sorted by `createdTime`, newest first.
   *
   * ```js
   * const runs = await client.extractionPipelines.runs
   *   .list({ externalId: 'my-pipeline' })
   *   .autoPagingToArray({ limit: 100 });
   * ```
   */
  public list = (
    query: ExtractionPipelineRunListQuery
  ): CursorAndAsyncIterator<ExtractionPipelineRun> => {
    return this.listEndpoint(this.callListEndpointWithGet, query);
  };

  /**
   * [Filter extraction pipeline runs](https://api-docs.cognite.com/20230101/tag/Extraction-Pipelines-Runs/operation/filterRuns)
   *
   * Runs are sorted by `createdTime`, newest first.
   *
   * ```js
   * const runs = await client.extractionPipelines.runs
   *   .filter({
   *     filter: {
   *       externalId: 'my-pipeline',
   *       statuses: ['failure'],
   *       message: { substring: 'timeout' },
   *     },
   *   })
   *   .autoPagingToArray({ limit: 100 });
   * ```
   */
  public filter = (
    query: ExtractionPipelineRunFilterQuery
  ): CursorAndAsyncIterator<ExtractionPipelineRun> => {
    return this.listEndpoint(this.callListEndpointWithPost, query);
  };
}
