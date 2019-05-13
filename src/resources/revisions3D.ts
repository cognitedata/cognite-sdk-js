// Copyright 2019 Cognite AS

import { AxiosInstance } from 'axios';
import { CogniteAsyncIterator } from '../autoPagination';
import { MetadataMap } from '../metadata';
import {
  generateCreateEndpoint,
  generateDeleteEndpoint,
  generateListEndpoint,
  generateRetrieveSingleEndpoint,
  generateUpdateEndpoint,
} from '../standardMethods';
import {
  CogniteInternalId,
  CreateRevision3D,
  InternalId,
  List3DNodesQuery,
  Node3D,
  Revision3D,
  Revision3DListRequest,
  UpdateRevision3D,
} from '../types/types';
import { projectUrl } from '../utils';

export interface Revisions3DAPI {
  /**
   * [List 3D revisions](https://doc.cognitedata.com/api/v1/#operation/get3DRevisions)
   *
   * ```js
   * const revisions3D = await client.revisions3D.list();
   * ```
   */
  list: (
    modelId: CogniteInternalId,
    filter?: Revision3DListRequest
  ) => CogniteAsyncIterator<Revision3D>;
  /**
   * [Create 3D revisions](https://doc.cognitedata.com/api/v1/#operation/create3DRevisions)
   *
   * ```js
   * const revisions = await client.revisions3D.create(model.id, [{ fileId: 8252999965991682 }, { fileId: 6305529564379596 }]);
   * ```
   */
  create: (
    modelId: CogniteInternalId,
    items: CreateRevision3D[]
  ) => Promise<Revision3D[]>;
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
  update: (
    modelId: CogniteInternalId,
    items: UpdateRevision3D[]
  ) => Promise<Revision3D[]>;
  /**
   * [Delete 3D revisions](https://doc.cognitedata.com/api/v1/#operation/delete3DRevisions)
   *
   * ```js
   * await client.revisions3D.delete(8252999965991682, [{ id: 4190022127342195 }]);
   * ```
   */
  delete: (modelId: CogniteInternalId, ids: InternalId[]) => Promise<{}>;
  /**
   * [Retrieve a 3D revision](https://doc.cognitedata.com/api/v1/#operation/get3DRevision)
   *
   * ```js
   * const revisions3D = await client.revisions3D.retrieve(8252999965991682, 4190022127342195)
   * ```
   */
  retrieve: (
    modelId: CogniteInternalId,
    revisionId: CogniteInternalId
  ) => Promise<Revision3D>;
  /**
   * [List 3D nodes](https://doc.cognitedata.com/api/v1/#operation/get3DNodes)
   *
   * ```js
   * const nodes3d = await client.revisions3D.list3DNodes(8252999965991682, 4190022127342195);
   * ```
   */
  list3DNodes: (
    modelId: CogniteInternalId,
    revisionId: CogniteInternalId,
    query?: List3DNodesQuery
  ) => CogniteAsyncIterator<Node3D>;
  /**
   * [List 3D ancestor nodes](https://doc.cognitedata.com/api/v1/#operation/get3DNodeAncestorss)
   *
   * ```js
   * const nodes3d = await client.revisions3D.list3DNodes(8252999965991682, 4190022127342195, 572413075141081);
   * ```
   */
  list3DNodeAncestors: (
    modelId: CogniteInternalId,
    revisionId: CogniteInternalId,
    nodeId: CogniteInternalId,
    query?: List3DNodesQuery
  ) => CogniteAsyncIterator<Node3D>;
}

/** @hidden */
export function generateRevisions3DObject(
  project: string,
  instance: AxiosInstance,
  map: MetadataMap
): Revisions3DAPI {
  function parameterizePath(
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

  return {
    list: (modelId: CogniteInternalId, filter?: Revision3DListRequest) => {
      return generateListEndpoint<Revision3DListRequest, Revision3D>(
        instance,
        parameterizePath(modelId),
        map,
        false
      )(filter);
    },
    create: (modelId: CogniteInternalId, items: CreateRevision3D[]) => {
      return generateCreateEndpoint<CreateRevision3D, Revision3D>(
        instance,
        parameterizePath(modelId),
        map
      )(items);
    },
    update: (modelId: CogniteInternalId, items: UpdateRevision3D[]) => {
      return generateUpdateEndpoint<UpdateRevision3D, Revision3D>(
        instance,
        parameterizePath(modelId),
        map
      )(items);
    },
    delete: (modelId: CogniteInternalId, ids: InternalId[]) => {
      return generateDeleteEndpoint(instance, parameterizePath(modelId), map)(
        ids
      );
    },
    retrieve: (modelId: CogniteInternalId, revisionId: CogniteInternalId) => {
      return generateRetrieveSingleEndpoint<CogniteInternalId, Revision3D>(
        instance,
        parameterizePath(modelId),
        map
      )(revisionId);
    },
    list3DNodes: (
      modelId: CogniteInternalId,
      revisionId: CogniteInternalId,
      query: List3DNodesQuery = {}
    ) => {
      return generateListEndpoint<List3DNodesQuery, Node3D>(
        instance,
        parameterizePath(modelId, revisionId),
        map,
        false
      )(query);
    },
    list3DNodeAncestors: (
      modelId: CogniteInternalId,
      revisionId: CogniteInternalId,
      nodeId: CogniteInternalId,
      query: List3DNodesQuery = {}
    ) => {
      return generateListEndpoint<List3DNodesQuery, Node3D>(
        instance,
        parameterizePath(modelId, revisionId, nodeId),
        map,
        false
      )(query);
    },
  };
}
