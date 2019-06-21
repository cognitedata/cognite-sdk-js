// Copyright 2019 Cognite AS

import { AxiosInstance } from 'axios';
import { CogniteAsyncIterator } from '../../autoPagination';
import { rawRequest } from '../../axiosWrappers';
import { MetadataMap } from '../../metadata';
import {
  generateCreateEndpoint,
  generateDeleteEndpoint,
  generateListEndpoint,
  generateRetrieveSingleEndpoint,
  generateUpdateEndpoint,
} from '../../standardMethods';
import {
  CogniteInternalId,
  CreateRevision3D,
  InternalId,
  List3DNodesQuery,
  Node3D,
  Revision3D,
  Revision3DListRequest,
  UpdateRevision3D,
} from '../../types';
import { projectUrl } from '../../utils';

export class Revisions3DAPI {
  private project: string;
  private instance: AxiosInstance;
  private map: MetadataMap;

  /** @hidden */
  constructor(project: string, instance: AxiosInstance, map: MetadataMap) {
    this.project = project;
    this.instance = instance;
    this.map = map;
  }

  /**
   * [List 3D revisions](https://doc.cognitedata.com/api/v1/#operation/get3DRevisions)
   *
   * ```js
   * const revisions3D = await client.revisions3D.list();
   * ```
   */
  public list: Revisions3DListEndpoint = (modelId, filter) => {
    return generateListEndpoint<Revision3DListRequest, Revision3D>(
      this.instance,
      parameterizePath(this.project, modelId),
      this.map,
      false
    )(filter);
  };

  /**
   * [Create 3D revisions](https://doc.cognitedata.com/api/v1/#operation/create3DRevisions)
   *
   * ```js
   * const revisions = await client.revisions3D.create(model.id, [{ fileId: 8252999965991682 }, { fileId: 6305529564379596 }]);
   * ```
   */
  public create: Revisions3DCreateEndpoint = (modelId, items) => {
    return generateCreateEndpoint<CreateRevision3D, Revision3D>(
      this.instance,
      parameterizePath(this.project, modelId),
      this.map
    )(items);
  };

  /**
   * [Update 3D revisions](https://doc.cognitedata.com/api/v1/#operation/update3DRevisions)
   *
   * ```js
   * const revisionsToUpdate = [{
   *  id: 6305529564379596,
   *  update: {
   *    set: {
   *      rotation: [1, 2, 3]
   *    }
   *  }
   * }]
   * const updated = await client.revisions3D.update(8252999965991682, revisionsToUpdate);
   * ```
   */
  public update: Revisions3DUpdateEndpoint = (modelId, items) => {
    return generateUpdateEndpoint<UpdateRevision3D, Revision3D>(
      this.instance,
      parameterizePath(this.project, modelId),
      this.map
    )(items);
  };

  /**
   * [Delete 3D revisions](https://doc.cognitedata.com/api/v1/#operation/delete3DRevisions)
   *
   * ```js
   * await client.revisions3D.delete(8252999965991682, [{ id: 4190022127342195 }]);
   * ```
   */
  public delete: Revisions3DDeleteEndpoint = (modelId, ids) => {
    return generateDeleteEndpoint(
      this.instance,
      parameterizePath(this.project, modelId),
      this.map
    )(ids);
  };

  /**
   * [Retrieve a 3D revision](https://doc.cognitedata.com/api/v1/#operation/get3DRevision)
   *
   * ```js
   * const revisions3D = await client.revisions3D.retrieve(8252999965991682, 4190022127342195)
   * ```
   */
  public retrieve: Revisions3DRetrieveEndpoint = (modelId, revisionId) => {
    return generateRetrieveSingleEndpoint<CogniteInternalId, Revision3D>(
      this.instance,
      parameterizePath(this.project, modelId),
      this.map
    )(revisionId);
  };

  public updateThumbnail: Revisions3DUpdateThumbnailEndpoint = async (
    modelId,
    revisionId,
    fileId
  ) => {
    const resourcePath = `${parameterizePath(
      this.project,
      modelId
    )}/${revisionId}`;
    const response = await rawRequest(
      this.instance,
      {
        method: 'post',
        url: `${resourcePath}/thumbnail`,
        data: { fileId },
      },
      true
    );
    return this.map.addAndReturn({}, response);
  };

  /**
   * [List 3D nodes](https://doc.cognitedata.com/api/v1/#operation/get3DNodes)
   *
   * ```js
   * const nodes3d = await client.revisions3D.list3DNodes(8252999965991682, 4190022127342195);
   * ```
   */
  public list3DNodes: Revisions3DListNodesEndpoint = (
    modelId,
    revisionId,
    query
  ) => {
    return generateListEndpoint<List3DNodesQuery, Node3D>(
      this.instance,
      parameterizePath(this.project, modelId, revisionId),
      this.map,
      false
    )(query);
  };

  /**
   * [List 3D ancestor nodes](https://doc.cognitedata.com/api/v1/#operation/get3DNodeAncestors)
   *
   * ```js
   * const nodes3d = await client.revisions3D.list3DNodes(8252999965991682, 4190022127342195, 572413075141081);
   * ```
   */
  public list3DNodeAncestors: Revisions3DListNodesAncestorsEndpoint = (
    modelId,
    revisionId,
    nodeId,
    query
  ) => {
    return generateListEndpoint<List3DNodesQuery, Node3D>(
      this.instance,
      parameterizePath(this.project, modelId, revisionId, nodeId),
      this.map,
      false
    )(query);
  };
}

export type Revisions3DListEndpoint = (
  modelId: CogniteInternalId,
  filter?: Revision3DListRequest
) => CogniteAsyncIterator<Revision3D>;

export type Revisions3DCreateEndpoint = (
  modelId: CogniteInternalId,
  items: CreateRevision3D[]
) => Promise<Revision3D[]>;

export type Revisions3DUpdateEndpoint = (
  modelId: CogniteInternalId,
  items: UpdateRevision3D[]
) => Promise<Revision3D[]>;

export type Revisions3DDeleteEndpoint = (
  modelId: CogniteInternalId,
  ids: InternalId[]
) => Promise<{}>;

export type Revisions3DRetrieveEndpoint = (
  modelId: CogniteInternalId,
  revisionId: CogniteInternalId
) => Promise<Revision3D>;

export type Revisions3DUpdateThumbnailEndpoint = (
  modelId: CogniteInternalId,
  revisionId: CogniteInternalId,
  fileId: CogniteInternalId
) => Promise<{}>;

export type Revisions3DListNodesEndpoint = (
  modelId: CogniteInternalId,
  revisionId: CogniteInternalId,
  query?: List3DNodesQuery
) => CogniteAsyncIterator<Node3D>;

export type Revisions3DListNodesAncestorsEndpoint = (
  modelId: CogniteInternalId,
  revisionId: CogniteInternalId,
  nodeId: CogniteInternalId,
  query?: List3DNodesQuery
) => CogniteAsyncIterator<Node3D>;

function parameterizePath(
  project: string,
  modelId: CogniteInternalId,
  revisionId?: CogniteInternalId,
  nodeId?: CogniteInternalId
) {
  let url = `${projectUrl(project)}/3d/models/${modelId}/revisions`;
  if (revisionId) {
    url += `/${revisionId}/nodes`;
    if (nodeId) {
      url += `/${nodeId}/ancestors`;
    }
  }
  return url;
}
