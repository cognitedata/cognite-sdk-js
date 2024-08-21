// Copyright 2020 Cognite AS

import {
  BaseResourceAPI,
  type CursorAndAsyncIterator,
  type ExternalId,
} from '@cognite/sdk-core';
import type {
  ExternalRelationship,
  IgnoreUnknownIds,
  Relationship,
  RelationshipsFilterRequest,
  RelationshipsRetrieveParams,
} from '../../types';

export class RelationshipsApi extends BaseResourceAPI<Relationship> {
  /**
   * @hidden
   */
  protected getDateProps() {
    return this.pickDateProps(['items'], ['createdTime', 'lastUpdatedTime']);
  }

  /**
   * [Create relationship](https://docs.cognite.com/api/v1/#operation/createRelationships)
   *
   * ```js
   * const relationships = [
   *   {
   *      externalId: 'some_relationship',
   *      sourceExternalId: 'some_source_external_id',
   *      sourceType: 'asset' as const,
   *      targetExternalId: 'some_target_external_id',
   *      targetType: 'event' as const
   *   }
   * ];
   * const createdRelationships = await client.relationships.create(relationships);
   * ```
   */
  public create = (items: ExternalRelationship[]): Promise<Relationship[]> => {
    return this.createEndpoint(items);
  };

  /**
   * [List relationships](https://docs.cognite.com/api/v1/#operation/listRelationships)
   *
   * ```js
   * const relationships = await client.relationships.list({ filter: { createdTime: { min: new Date('1 jan 2018'), max: new Date('1 jan 2019') }}});
   * ```
   */
  public list = (
    query?: RelationshipsFilterRequest
  ): CursorAndAsyncIterator<Relationship> => {
    return super.listEndpoint(this.callListEndpointWithPost, query);
  };

  /**
   * [Retrieve relationships](https://docs.cognite.com/api/v1/#operation/byidsRelationships)
   *
   * ```js
   * const relationships = await client.relationships.retrieve([{externalId: 'abc'}, {externalId: 'def'}]);
   * ```
   */
  public retrieve = (
    ids: ExternalId[],
    params: RelationshipsRetrieveParams = {}
  ): Promise<Relationship[]> => {
    return super.retrieveEndpoint(ids, params);
  };

  /**
   * [Delete relationships](https://doc.cognitedata.com/api/v1/#operation/deleteRelationships)
   *
   * ```js
   * await client.relationships.delete([{externalId: 'abc'}, {externalId: 'def'}]);
   * ```
   */
  public delete = (
    ids: ExternalId[],
    params: RelationshipsDeleteParams = {}
  ) => {
    return super.deleteEndpoint(ids, params);
  };
}

export type RelationshipsDeleteParams = IgnoreUnknownIds;
