// Copyright 2026 Cognite AS

import {
  BaseResourceAPI,
  type CDFHttpClient,
  type CursorAndAsyncIterator,
  type FilterQuery,
  type IdEither,
  type MetadataMap,
} from '@cognite/sdk-core';
import type { IgnoreUnknownIds } from '../../types';
import { ExtractionPipelineConfigsAPI } from './extractionPipelineConfigsApi';
import { ExtractionPipelineRunsAPI } from './extractionPipelineRunsApi';
import type {
  ExtractionPipeline,
  ExtractionPipelineChange,
  ExtractionPipelineCreate,
  ExtractionPipelineFilterQuery,
} from './types';

export class ExtractionPipelinesAPI extends BaseResourceAPI<ExtractionPipeline> {
  private readonly runsApi: ExtractionPipelineRunsAPI;
  private readonly configApi: ExtractionPipelineConfigsAPI;

  /** @hidden */
  constructor(resourcePath: string, ...args: [CDFHttpClient, MetadataMap]) {
    super(resourcePath, ...args);
    this.runsApi = new ExtractionPipelineRunsAPI(
      `${resourcePath}/runs`,
      ...args
    );
    this.configApi = new ExtractionPipelineConfigsAPI(resourcePath, ...args);
  }

  /**
   * [Extraction pipeline runs](https://api-docs.cognite.com/20230101/tag/Extraction-Pipelines-Runs)
   */
  public get runs() {
    return this.runsApi;
  }

  /**
   * [Extraction pipeline configuration revisions](https://api-docs.cognite.com/20230101/tag/Extraction-Pipelines-Config)
   */
  public get config() {
    return this.configApi;
  }

  /**
   * [Create extraction pipelines](https://api-docs.cognite.com/20230101/tag/Extraction-Pipelines/operation/createExtPipes)
   *
   * ```js
   * const pipelines = await client.extractionPipelines.create([
   *   { externalId: 'my-pipeline', name: 'My pipeline', dataSetId: 123 },
   * ]);
   * ```
   */
  public create = (
    items: ExtractionPipelineCreate[]
  ): Promise<ExtractionPipeline[]> => {
    return this.createEndpoint(items);
  };

  /**
   * [List extraction pipelines](https://api-docs.cognite.com/20230101/tag/Extraction-Pipelines/operation/listExtPipes)
   *
   * ```js
   * const pipelines = await client.extractionPipelines
   *   .list()
   *   .autoPagingToArray({ limit: 100 });
   * ```
   */
  public list = (
    query?: FilterQuery
  ): CursorAndAsyncIterator<ExtractionPipeline> => {
    return this.listEndpoint(this.callListEndpointWithGet, query);
  };

  /**
   * [Filter extraction pipelines](https://api-docs.cognite.com/20230101/tag/Extraction-Pipelines/operation/filterExtPipes)
   *
   * ```js
   * const pipelines = await client.extractionPipelines
   *   .filter({ filter: { externalIdPrefix: 'my-', dataSetIds: [{ id: 123 }] } })
   *   .autoPagingToArray({ limit: 100 });
   * ```
   */
  public filter = (
    query?: ExtractionPipelineFilterQuery
  ): CursorAndAsyncIterator<ExtractionPipeline> => {
    return this.listEndpoint(this.callListEndpointWithPost, query);
  };

  /**
   * [Retrieve extraction pipelines](https://api-docs.cognite.com/20230101/tag/Extraction-Pipelines/operation/byidsExtPipes)
   *
   * ```js
   * const pipelines = await client.extractionPipelines.retrieve([
   *   { id: 123 },
   *   { externalId: 'my-pipeline' },
   * ]);
   * ```
   */
  public retrieve = (
    ids: IdEither[],
    params: IgnoreUnknownIds = {}
  ): Promise<ExtractionPipeline[]> => {
    return this.retrieveEndpoint(ids, params);
  };

  /**
   * [Update extraction pipelines](https://api-docs.cognite.com/20230101/tag/Extraction-Pipelines/operation/updateExtPipes)
   *
   * ```js
   * const pipelines = await client.extractionPipelines.update([
   *   {
   *     externalId: 'my-pipeline',
   *     update: {
   *       schedule: { set: 'Continuous' },
   *       contacts: { add: [{ email: 'me@example.com', sendNotification: true }] },
   *     },
   *   },
   * ]);
   * ```
   */
  public update = (
    changes: ExtractionPipelineChange[]
  ): Promise<ExtractionPipeline[]> => {
    return this.updateEndpoint(changes);
  };

  /**
   * [Delete extraction pipelines](https://api-docs.cognite.com/20230101/tag/Extraction-Pipelines/operation/deleteExtPipes)
   *
   * Also deletes the runs of the extraction pipelines.
   *
   * ```js
   * await client.extractionPipelines.delete([{ id: 123 }, { externalId: 'my-pipeline' }]);
   * ```
   */
  public delete = (ids: IdEither[], params: IgnoreUnknownIds = {}) => {
    return this.deleteEndpoint(ids, params);
  };
}
