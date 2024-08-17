// Copyright 2020 Cognite AS

import {
  BaseResourceAPI,
  type CDFHttpClient,
  type CursorAndAsyncIterator,
  type MetadataMap,
} from '@cognite/sdk-core';
import type {
  CogniteInternalId,
  CreateRevision3D,
  Filter3DNodesQuery,
  InternalId,
  List3DNodesQuery,
  Node3D,
  Revision3D,
  Revision3DListRequest,
  UpdateRevision3D,
} from '../../types';
import { Nodes3DAPI } from './nodes3DApi';

export class Revisions3DAPI extends BaseResourceAPI<Revision3D> {
  private nodes3DApi: Nodes3DAPI;
  constructor(
    resourcePath: string,
    httpClient: CDFHttpClient,
    map: MetadataMap,
  ) {
    super(resourcePath, httpClient, map);
    this.nodes3DApi = new Nodes3DAPI(resourcePath, httpClient, map);
  }

  /**
   * @hidden
   */
  protected getDateProps() {
    return this.pickDateProps(['items'], ['createdTime']);
  }

  /**
   * [Create 3D revisions](https://doc.cognitedata.com/api/v1/#operation/create3DRevisions)
   *
   * ```js
   * const revisions = await client.revisions3D.create(4234325345643654, [{ fileId: 8252999965991682 }, { fileId: 6305529564379596 }]);
   * ```
   */
  public create = (
    modelId: CogniteInternalId,
    items: CreateRevision3D[],
  ): Promise<Revision3D[]> => {
    return super.createEndpoint(items, this.url(`${modelId}/revisions`));
  };

  /**
   * [List 3D revisions](https://doc.cognitedata.com/api/v1/#operation/get3DRevisions)
   *
   * ```js
   * const revisions3D = await client.revisions3D.list(324566546546346);
   * ```
   */
  public list = (
    modelId: CogniteInternalId,
    filter?: Revision3DListRequest,
  ): CursorAndAsyncIterator<Revision3D> => {
    const path = this.url(`${modelId}/revisions`);
    return super.listEndpoint((params) => this.get(path, { params }), filter);
  };

  /**
   * [Retrieve a 3D revision](https://doc.cognitedata.com/api/v1/#operation/get3DRevision)
   *
   * ```js
   * const revisions3D = await client.revisions3D.retrieve(8252999965991682, 4190022127342195)
   * ```
   */
  public retrieve = async (
    modelId: CogniteInternalId,
    revisionId: CogniteInternalId,
  ): Promise<Revision3D> => {
    const path = this.url(`${modelId}/revisions/${revisionId}`);
    const response = await this.get<Revision3D>(path);
    return this.addToMapAndReturn(response.data, response);
  };

  /**
   * [Update 3D revisions](https://doc.cognitedata.com/api/v1/#operation/update3DRevisions)
   *
   * ```js
   * const revisionsToUpdate = [{
   *  id: 6305529564379596,
   *  update: {
   *    rotation: {
   *      set: [1, 2, 3]
   *    },
   *    translation: {
   *      set: [4, 5, 6]
   *    },
   *    scale: {
   *      set: [0.5, 0.3, 0.2]
   *    }
   *  }
   * }];
   * const updated = await client.revisions3D.update(8252999965991682, revisionsToUpdate);
   * ```
   */
  public update = (
    modelId: CogniteInternalId,
    items: UpdateRevision3D[],
  ): Promise<Revision3D[]> => {
    const path = this.url(`${modelId}/revisions/update`);
    return super.updateEndpoint(items, path);
  };

  /**
   * [Delete 3D revisions](https://doc.cognitedata.com/api/v1/#operation/delete3DRevisions)
   *
   * ```js
   * await client.revisions3D.delete(8252999965991682, [{ id: 4190022127342195 }]);
   * ```
   */
  public delete = (
    modelId: CogniteInternalId,
    ids: InternalId[],
  ): Promise<object> => {
    const path = this.url(`${modelId}/revisions/delete`);
    return super.deleteEndpoint(ids, undefined, path);
  };

  /**
   * [Update 3D revision thumbnail](https://docs.cognite.com/api/v1/#operation/updateThumbnail)
   *
   * ```js
   * await client.revisions3D.updateThumbnail(8252999965991682, 4190022127342195, 3243334242324);
   * ```
   */
  public updateThumbnail = async (
    modelId: CogniteInternalId,
    revisionId: CogniteInternalId,
    fileId: CogniteInternalId,
  ): Promise<object> => {
    const path = this.url(`${modelId}/revisions/${revisionId}/thumbnail`);
    const response = await this.post<object>(path, { data: { fileId } });
    return this.addToMapAndReturn({}, response);
  };

  /**
   * [List 3D nodes](https://doc.cognitedata.com/api/v1/#operation/get3DNodes)
   *
   * ```js
   * const nodes3d = await client.revisions3D.list3DNodes(8252999965991682, 4190022127342195);
   * ```
   */
  public list3DNodes = (
    modelId: CogniteInternalId,
    revisionId: CogniteInternalId,
    query?: List3DNodesQuery,
  ): CursorAndAsyncIterator<Node3D> => {
    return this.nodes3DApi.list(modelId, revisionId, query);
  };

  /**
   * [Filter 3D nodes](https://docs.cognite.com/api/v1/#operation/filter3DNodes)
   *
   * ```js
   * const query = {
   *  filter: {
   *    properties: {
   *      Items: {
   *        Type: ["Cylinder"]
   *      }
   *    }
   *  },
   *  partition: "1/10"
   * };
   * const nodes3d = await client.revisions3D.filter3DNodes(8252999965991682, 4190022127342195, query);
   * ```
   */
  public filter3DNodes = (
    modelId: CogniteInternalId,
    revisionId: CogniteInternalId,
    query?: Filter3DNodesQuery,
  ): CursorAndAsyncIterator<Node3D> => {
    return this.nodes3DApi.filter(modelId, revisionId, query);
  };

  /**
   * [Get 3D nodes by ID](https://docs.cognite.com/api/v1/#operation/get3DNodesById)
   *
   * ```js
   * const nodes3d = await client.revisions3D.retrieve3DNodes(8252999965991682, 4190022127342195, [{id: 123}, {id: 456}]);
   * ```
   */
  public retrieve3DNodes = (
    modelId: CogniteInternalId,
    revisionId: CogniteInternalId,
    ids: InternalId[],
  ): Promise<Node3D[]> => {
    return this.nodes3DApi.retrieve(modelId, revisionId, ids);
  };

  /**
   * [List 3D ancestor nodes](https://doc.cognitedata.com/api/v1/#operation/get3DNodeAncestors)
   *
   * ```js
   * const nodes3d = await client.revisions3D.list3DNodeAncestors(8252999965991682, 4190022127342195, 572413075141081);
   * ```
   */
  public list3DNodeAncestors = (
    modelId: CogniteInternalId,
    revisionId: CogniteInternalId,
    nodeId: CogniteInternalId,
    query?: List3DNodesQuery,
  ): CursorAndAsyncIterator<Node3D> => {
    return this.nodes3DApi.listAncestors(modelId, revisionId, nodeId, query);
  };
}
