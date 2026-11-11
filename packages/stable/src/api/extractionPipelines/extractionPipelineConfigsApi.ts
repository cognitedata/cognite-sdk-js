// Copyright 2026 Cognite AS

import {
  BaseResourceAPI,
  type CursorAndAsyncIterator,
  type CursorResponse,
} from '@cognite/sdk-core';
import type {
  ExtractionPipelineConfig,
  ExtractionPipelineConfigCreate,
  ExtractionPipelineConfigListQuery,
  ExtractionPipelineConfigRetrieveParams,
  ExtractionPipelineConfigRevertRequest,
  ExtractionPipelineConfigRevision,
} from './configTypes';

export class ExtractionPipelineConfigsAPI extends BaseResourceAPI<ExtractionPipelineConfig> {
  /**
   * [Get a single configuration revision](https://api-docs.cognite.com/20230101/tag/Extraction-Pipelines-Config/operation/getExtPipeConfigRevision)
   *
   * Retrieves the latest revision unless `revision` or `activeAtTime` is set.
   *
   * ```js
   * const config = await client.extractionPipelines.config.retrieve({
   *   externalId: 'my-pipeline',
   * });
   * ```
   */
  public retrieve = async (
    params: ExtractionPipelineConfigRetrieveParams
  ): Promise<ExtractionPipelineConfig> => {
    const response = await this.get<ExtractionPipelineConfig>(
      this.url('config'),
      {
        params,
      }
    );
    return this.addToMapAndReturn(response.data, response);
  };

  /**
   * [List configuration revisions](https://api-docs.cognite.com/20230101/tag/Extraction-Pipelines-Config/operation/listExtPipeConfigRevisions)
   *
   * The listed revisions don't include the configuration content.
   *
   * ```js
   * const revisions = await client.extractionPipelines.config
   *   .list({ externalId: 'my-pipeline' })
   *   .autoPagingToArray({ limit: 100 });
   * ```
   */
  public list = (
    query: ExtractionPipelineConfigListQuery
  ): CursorAndAsyncIterator<ExtractionPipelineConfigRevision> => {
    const path = this.url('config/revisions');
    return this.cursorBasedEndpoint<
      ExtractionPipelineConfigListQuery,
      ExtractionPipelineConfigRevision
    >(
      (params) =>
        this.get<CursorResponse<ExtractionPipelineConfigRevision[]>>(path, {
          params,
        }),
      query
    );
  };

  /**
   * [Create extraction configuration revision](https://api-docs.cognite.com/20230101/tag/Extraction-Pipelines-Config/operation/createExtPipeConfig)
   *
   * ```js
   * const config = await client.extractionPipelines.config.create({
   *   externalId: 'my-pipeline',
   *   config: 'logger:\n  console:\n    level: INFO\n',
   *   description: 'Initial configuration',
   * });
   * ```
   */
  public create = async (
    config: ExtractionPipelineConfigCreate
  ): Promise<ExtractionPipelineConfig> => {
    const response = await this.post<ExtractionPipelineConfig>(
      this.url('config'),
      {
        data: config,
      }
    );
    return this.addToMapAndReturn(response.data, response);
  };

  /**
   * [Revert configuration revision](https://api-docs.cognite.com/20230101/tag/Extraction-Pipelines-Config/operation/revertExtPipeConfigRevision)
   *
   * Creates a new revision that is identical to the given older revision.
   *
   * ```js
   * const config = await client.extractionPipelines.config.revert({
   *   externalId: 'my-pipeline',
   *   revision: 1,
   * });
   * ```
   */
  public revert = async (
    request: ExtractionPipelineConfigRevertRequest
  ): Promise<ExtractionPipelineConfig> => {
    const response = await this.post<ExtractionPipelineConfig>(
      this.url('config/revert'),
      { data: request }
    );
    return this.addToMapAndReturn(response.data, response);
  };
}
