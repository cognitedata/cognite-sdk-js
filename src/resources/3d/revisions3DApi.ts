// Copyright 2019 Cognite AS

import { CursorAndAsyncIterator } from '../../autoPagination';
import { MetadataMap } from '../../metadata';
import { BaseResourceAPI } from '../../resources/baseResourceApi';
import {
  CogniteInternalId,
  CreateRevision3D,
  InternalId,
  List3DNodesQuery,
  Node3D,
  Revision3D,
  Revision3DListRequest,
  UpdateRevision3D,
} from '../../types/types';
import { CDFHttpClient } from '../../utils/http/cdfHttpClient';
import { Nodes3DAPI } from './nodes3DApi';

export class Revisions3DAPI extends BaseResourceAPI<Revision3D> {
  private nodes3DApi: Nodes3DAPI;
  constructor(
    resourcePath: string,
    httpClient: CDFHttpClient,
    map: MetadataMap
  ) {
    super(resourcePath, httpClient, map);
    this.nodes3DApi = new Nodes3DAPI(resourcePath, httpClient, map);
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
    items: CreateRevision3D[]
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
    filter?: Revision3DListRequest
  ): CursorAndAsyncIterator<Revision3D> => {
    const path = this.url(`${modelId}/revisions`);
    return super.listEndpoint(
      params => this.httpClient.get(path, { params }),
      filter
    );
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
    revisionId: CogniteInternalId
  ): Promise<Revision3D> => {
    const path = this.url(`${modelId}/revisions/${revisionId}`);
    const response = await this.httpClient.get<Revision3D>(path);
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
   *    }
   *  }
   * }];
   * const updated = await client.revisions3D.update(8252999965991682, revisionsToUpdate);
   * ```
   */
  public update = (
    modelId: CogniteInternalId,
    items: UpdateRevision3D[]
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
    ids: InternalId[]
  ): Promise<{}> => {
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
    fileId: CogniteInternalId
  ): Promise<{}> => {
    const path = this.url(`${modelId}/revisions/${revisionId}/thumbnail`);
    const response = await this.httpClient.post<{}>(path, { data: { fileId } });
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
    query?: List3DNodesQuery
  ): CursorAndAsyncIterator<Node3D> => {
    return this.nodes3DApi.list(modelId, revisionId, query);
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
    query?: List3DNodesQuery
  ): CursorAndAsyncIterator<Node3D> => {
    return this.nodes3DApi.listAncestors(modelId, revisionId, nodeId, query);
  };
}
