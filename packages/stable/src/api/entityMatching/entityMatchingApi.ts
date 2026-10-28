// Copyright 2020 Cognite AS

import {
  BaseResourceAPI,
  type CursorAndAsyncIterator,
  type IdEither,
} from '@cognite/sdk-core';
import type {
  ContextJobId,
  EntityMatchingChange,
  EntityMatchingCreateRequest,
  EntityMatchingCreateResponse,
  EntityMatchingFilterRequest,
  EntityMatchingModel,
  EntityMatchingPredictRequest,
  EntityMatchingPredictResponse,
  EntityMatchingPredictions,
  EntityMatchingRefitRequest,
  EntityMatchingRefitResponse,
} from '../../types';

/**
 * Entity matching works on any objects with string fields, so it is not tied to asset-centric resources.
 * To match data modeling instances, pass each node with its `space` as an extra field: `externalId` is
 * only unique within a space, and every field of a source or target is returned in the predictions.
 */
export class EntityMatchingApi extends BaseResourceAPI<EntityMatchingModel> {
  /**
   * @hidden
   */
  protected getDateProps() {
    return this.pickDateProps(
      ['items'],
      ['createdTime', 'startTime', 'statusTime']
    );
  }

  /**
   * [Create entity matcher](https://docs.cognite.com/api/v1/#operation/entityMatchingCreate)
   *
   * ```js
   * // Match time series to assets, both stored as core data model instances.
   * const { items: timeSeries } = await client.instances.list({
   *   instanceType: 'node',
   *   sources: [{ source: { type: 'view', space: 'cdf_cdm', externalId: 'CogniteTimeSeries', version: 'v1' } }],
   * });
   * const { items: assets } = await client.instances.list({
   *   instanceType: 'node',
   *   sources: [{ source: { type: 'view', space: 'cdf_cdm', externalId: 'CogniteAsset', version: 'v1' } }],
   * });
   * // externalId is only unique within a space, so keep the space as an extra field.
   * const sources = timeSeries.map((node) => ({
   *   externalId: node.externalId,
   *   space: node.space,
   *   name: String(node.properties?.cdf_cdm?.['CogniteTimeSeries/v1']?.name ?? ''),
   * }));
   * const targets = assets.map((node) => ({
   *   externalId: node.externalId,
   *   space: node.space,
   *   name: String(node.properties?.cdf_cdm?.['CogniteAsset/v1']?.name ?? ''),
   * }));
   *
   * const result = await client.entityMatching.create({
   *   sources,
   *   targets,
   *   externalId: 'model123',
   *   name: 'model123',
   * });
   * ```
   */
  public create = async (
    scope: EntityMatchingCreateRequest
  ): Promise<EntityMatchingCreateResponse> => {
    const path = this.url();
    const response = await this.post<EntityMatchingCreateResponse>(path, {
      data: scope,
    });
    return this.addToMapAndReturn(response.data, response);
  };

  /**
   * [Retrieve entity matching models](https://docs.cognite.com/api/v1/#operation/entityMatchingRetrieve)
   *
   * ```js
   * const [result] = await client.entityMatching.retrieve([{ externalId: 'model123' }]);
   * ```
   */
  public retrieve = (ids: IdEither[]): Promise<EntityMatchingModel[]> => {
    return super.retrieveEndpoint(ids);
  };

  /**
   * [List entity matching models](https://docs.cognite.com/api/v1/#operation/entityMatchingFilter)
   *
   * ```js
   * const { items } = await client.entityMatching.list({ filter: { name: 'model123' }});
   * ```
   */
  public list = (
    scope?: EntityMatchingFilterRequest
  ): CursorAndAsyncIterator<EntityMatchingModel> => {
    return super.listEndpoint(this.callListEndpointWithPost, scope);
  };

  /**
   * [Update entity matching models](https://docs.cognite.com/api/v1/#operation/entityMatchingUpdate)
   *
   * ```js
   * const [updated] = await client.entityMatching.update([{
   *  externalId: 'model123',
   *  update: { description: { set: 'ø' }}
   * }]);
   * ```
   */
  public update = (
    changes: EntityMatchingChange[]
  ): Promise<EntityMatchingModel[]> => {
    return super.updateEndpoint(changes);
  };

  /**
   * [Delete entity matcher model](https://docs.cognite.com/api/v1/#operation/entityMatchingDelete)
   *
   * ```js
   * await client.entityMatching.delete([{ externalId: 'model123' }]);
   * ```
   */
  public delete = async (ids: IdEither[]): Promise<object> => {
    return super.deleteEndpoint(ids);
  };

  /**
   * [Predict matches](https://docs.cognite.com/api/v1/#operation/entityMatchingPredict)
   *
   * ```js
   * // sources and targets built from instances as in the create example:
   * // { externalId: node.externalId, space: node.space, name: ... }
   * const response = await client.entityMatching.predict({
   *   externalId: 'model123',
   *   sources: [{ externalId: 'pump-01-pressure', space: 'my-space', name: 'Pump 01 pressure' }],
   *   targets: [{ externalId: 'pump-01', space: 'my-space', name: 'Pump 01' }],
   * });
   * ```
   */
  public predict = async (
    scope: EntityMatchingPredictRequest
  ): Promise<EntityMatchingPredictResponse> => {
    const path = this.url('predict');
    const response = await this.post<EntityMatchingPredictResponse>(path, {
      data: scope,
    });
    return this.addToMapAndReturn(response.data, response);
  };

  /**
   * [Retrieve entity matcher predict result](https://docs.cognite.com/api/playground/#operation/entityMatchingPredictResults)
   *
   * ```js
   * const { status, items } = await client.entityMatching.predictResult(12345678);
   * // The space passed in with each target comes back, so a match maps to an instance id.
   * const best = items[0].matches[0];
   * const assetId = { space: String(best.matchTo.space), externalId: String(best.matchTo.externalId) };
   * ```
   */
  public predictResult = async (
    jobId: ContextJobId
  ): Promise<EntityMatchingPredictions> => {
    const path = this.url(`jobs/${jobId}`);
    const response = await this.get<EntityMatchingPredictions>(path);
    return this.addToMapAndReturn(response.data, response);
  };

  /**
   * [Re-fit entity matcher model](https://docs.cognite.com/api/v1/#operation/entityMatchingReFit)
   *
   * ```js
   * await client.entityMatching.refit({
   *   externalId: 'model123',
   *   newExternalId: 'newModel123',
   *   sources: [{ externalId: 'pump-01-pressure', space: 'my-space', name: 'Pump 01 pressure' }],
   *   targets: [{ externalId: 'pump-01', space: 'my-space', name: 'Pump 01' }],
   *   // Confirmed matches refer to sources and targets by externalId.
   *   trueMatches: [{ sourceExternalId: 'pump-01-pressure', targetExternalId: 'pump-01' }],
   * });
   * ```
   */
  public refit = async (
    scope: EntityMatchingRefitRequest
  ): Promise<EntityMatchingRefitResponse> => {
    const path = this.url('refit');
    const response = await this.post<EntityMatchingRefitResponse>(path, {
      data: scope,
    });
    return this.addToMapAndReturn(response.data, response);
  };
}
