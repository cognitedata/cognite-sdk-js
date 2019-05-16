// Copyright 2019 Cognite AS

import { AxiosInstance } from 'axios';
import { CogniteAsyncIterator } from '../autoPagination';
import { MetadataMap } from '../metadata';
import {
  generateListEndpoint,
  generateRetrieveSingleEndpoint,
} from '../standardMethods';
import {
  CogniteInternalId,
  List3DNodesQuery,
  ListRevealSectors3DQuery,
  RevealNode3D,
  RevealRevision3D,
  RevealSector3D,
} from '../types/types';
import { projectUrl } from '../utils';

export interface Viewer3DAPI {
  /**
   * [Retrieve a 3D revision (Reveal)](https://doc.cognitedata.com/api/v1/#operation/getReveal3DRevision)
   *
   * ```js
   * const revisionReveal = await client.viewer3D.retrieveRevealRevision3D(294879032167592, 3247239473298342)
   * ```
   */
  retrieveRevealRevision3D: (
    modelId: CogniteInternalId,
    revisionId: CogniteInternalId
  ) => Promise<RevealRevision3D>;
  /**
   * [List 3D nodes (Reveal)](https://doc.cognitedata.com/api/v1/#operation/revealGet3DNodes)
   *
   * ```js
   * const nodes3dReveal = await client.viewer3D
   *  .listRevealNodes3D(8252999965991682, 4190022127342195)
   *  .autoPagingToArray();
   * ```
   */
  listRevealNodes3D: (
    modelId: CogniteInternalId,
    revisionId: CogniteInternalId,
    query?: List3DNodesQuery
  ) => CogniteAsyncIterator<RevealNode3D>;
  /**
   * [List 3D ancestor nodes (Reveal)](https://doc.cognitedata.com/api/v1/#operation/revealGet3DNodeAncestors)
   *
   * ```js
   * const ancestorsReveal = await client.viewer3D
   *  .listRevealNode3DAncestors(8252999965991682, 4190022127342195, 120982398890213)
   *  .autoPagingToArray();
   * ```
   */
  listRevealNode3DAncestors: (
    modelId: CogniteInternalId,
    revisionId: CogniteInternalId,
    nodeId: CogniteInternalId,
    query?: List3DNodesQuery
  ) => CogniteAsyncIterator<RevealNode3D>;
  /**
   * [List 3D sectors (Reveal)](https://doc.cognitedata.com/api/v1/#operation/revealGet3DSectors)
   *
   * ```js
   * const sectors3D = await client.viewer3D.revisions3D
   *  .listRevealSectors3D(8252999965991682, 4190022127342195, { limit: 10 })
   *  .autoPagingToArray();
   * ```
   */
  listRevealSectors3D: (
    modelId: CogniteInternalId,
    revisionId: CogniteInternalId,
    query?: ListRevealSectors3DQuery
  ) => CogniteAsyncIterator<RevealSector3D>;
  /**
   * [Retrieve a 3D revision (Unreal)](https://doc.cognitedata.com/api/v1/#operation/getUnreal3DRevision)
   *
   * ```js
   * const revisions3DUnreal = await client.viewer3D.retrieveUnrealRevision3D(8252999965991682, 4190022127342195);
   * ```
   */
  retrieveUnrealRevision3D: (
    modelId: CogniteInternalId,
    revisionId: CogniteInternalId
  ) => Promise<RevealRevision3D>;
}

/** @hidden */
export function generateViewer3DObject(
  project: string,
  instance: AxiosInstance,
  map: MetadataMap
): Viewer3DAPI {
  function parameterizePath(
    modelId: CogniteInternalId,
    revisionId: CogniteInternalId,
    unreal: boolean = false
  ) {
    const type3D = unreal ? 'unreal' : 'reveal';
    return `${projectUrl(
      project
    )}/3d/${type3D}/models/${modelId}/revisions/${revisionId}`;
  }

  return {
    retrieveRevealRevision3D: (
      modelId: CogniteInternalId,
      revisionId: CogniteInternalId
    ) => {
      return generateRetrieveSingleEndpoint<
        CogniteInternalId,
        RevealRevision3D
      >(instance, parameterizePath(modelId, revisionId), map)(revisionId);
    },
    listRevealNodes3D: (
      modelId: CogniteInternalId,
      revisionId: CogniteInternalId,
      query: List3DNodesQuery = {}
    ) => {
      return generateListEndpoint<List3DNodesQuery, RevealNode3D>(
        instance,
        parameterizePath(modelId, revisionId) + '/nodes',
        map,
        false
      )(query);
    },
    listRevealNode3DAncestors: (
      modelId: CogniteInternalId,
      revisionId: CogniteInternalId,
      nodeId: CogniteInternalId,
      query: List3DNodesQuery = {}
    ) => {
      return generateListEndpoint<List3DNodesQuery, RevealNode3D>(
        instance,
        parameterizePath(modelId, revisionId) + `/nodes/${nodeId}`,
        map,
        false
      )(query);
    },
    listRevealSectors3D: (
      modelId: CogniteInternalId,
      revisionId: CogniteInternalId,
      query: ListRevealSectors3DQuery = {}
    ) => {
      return generateListEndpoint<ListRevealSectors3DQuery, RevealSector3D>(
        instance,
        parameterizePath(modelId, revisionId) + `/sectors`,
        map,
        false
      )(query);
    },
    retrieveUnrealRevision3D: (
      modelId: CogniteInternalId,
      revisionId: CogniteInternalId
    ) => {
      return generateRetrieveSingleEndpoint<
        CogniteInternalId,
        RevealRevision3D
      >(instance, parameterizePath(modelId, revisionId, true), map)(revisionId);
    },
  };
}
