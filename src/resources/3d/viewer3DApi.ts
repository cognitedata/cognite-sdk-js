// Copyright 2019 Cognite AS

import { AxiosInstance } from 'axios';
import { CogniteAsyncIterator } from '../../autoPagination';
import { MetadataMap } from '../../metadata';
import {
  generateListEndpoint,
  generateRetrieveSingleEndpoint,
} from '../../standardMethods';
import {
  CogniteInternalId,
  List3DNodesQuery,
  ListRevealSectors3DQuery,
  RevealNode3D,
  RevealRevision3D,
  RevealSector3D,
} from '../../types/types';
import { projectUrl } from '../../utils';

export class Viewer3DAPI {
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
   * [Retrieve a 3D revision (Reveal)](https://doc.cognitedata.com/api/v1/#operation/getReveal3DRevision)
   *
   * ```js
   * const revisionReveal = await client.viewer3D.retrieveRevealRevision3D(294879032167592, 3247239473298342)
   * ```
   */
  public retrieveRevealRevision3D: Viewer3DRetrieveRevealRevisionEndpoint = (
    modelId,
    revisionId
  ) => {
    return generateRetrieveSingleEndpoint<CogniteInternalId, RevealRevision3D>(
      this.instance,
      parameterizePath(this.project, modelId, revisionId),
      this.map
    )(revisionId);
  };

  /**
   * [List 3D nodes (Reveal)](https://doc.cognitedata.com/api/v1/#operation/revealGet3DNodes)
   *
   * ```js
   * const nodes3dReveal = await client.viewer3D
   *  .listRevealNodes3D(8252999965991682, 4190022127342195)
   *  .autoPagingToArray();
   * ```
   */
  public listRevealNodes3D: Viewer3DListRevealNodes3DEndpoint = (
    modelId,
    revisionId,
    query
  ) => {
    return generateListEndpoint<List3DNodesQuery, RevealNode3D, RevealNode3D>(
      this.instance,
      parameterizePath(this.project, modelId, revisionId) + '/nodes',
      this.map,
      false,
      items => items
    )(query);
  };

  /**
   * [List 3D ancestor nodes (Reveal)](https://doc.cognitedata.com/api/v1/#operation/revealGet3DNodeAncestors)
   *
   * ```js
   * const ancestorsReveal = await client.viewer3D
   *  .listRevealNode3DAncestors(8252999965991682, 4190022127342195, 120982398890213)
   *  .autoPagingToArray();
   * ```
   */
  public listRevealNode3DAncestors: Viewer3DListRevealNodeAncestorsEndpoint = (
    modelId,
    revisionId,
    nodeId,
    query
  ) => {
    return generateListEndpoint<List3DNodesQuery, RevealNode3D, RevealNode3D>(
      this.instance,
      parameterizePath(this.project, modelId, revisionId) + `/nodes/${nodeId}`,
      this.map,
      false,
      items => items
    )(query);
  };

  /**
   * [List 3D sectors (Reveal)](https://doc.cognitedata.com/api/v1/#operation/revealGet3DSectors)
   *
   * ```js
   * const sectors3D = await client.viewer3D.revisions3D
   *  .listRevealSectors3D(8252999965991682, 4190022127342195, { limit: 10 })
   *  .autoPagingToArray();
   * ```
   */
  public listRevealSectors3D: Viewer3DListRevealSectorsEndpoint = (
    modelId,
    revisionId,
    query
  ) => {
    return generateListEndpoint<
      ListRevealSectors3DQuery,
      RevealSector3D,
      RevealSector3D
    >(
      this.instance,
      parameterizePath(this.project, modelId, revisionId) + `/sectors`,
      this.map,
      false,
      items => items
    )(query);
  };

  /**
   * [Retrieve a 3D revision (Unreal)](https://doc.cognitedata.com/api/v1/#operation/getUnreal3DRevision)
   *
   * ```js
   * const revisions3DUnreal = await client.viewer3D.retrieveUnrealRevision3D(8252999965991682, 4190022127342195);
   * ```
   */
  public retrieveUnrealRevision3D: Viewer3DRetrieveUnrealRevisionEndpoint = (
    modelId,
    revisionId
  ) => {
    return generateRetrieveSingleEndpoint<CogniteInternalId, RevealRevision3D>(
      this.instance,
      parameterizePath(this.project, modelId, revisionId, true),
      this.map
    )(revisionId);
  };
}

export type Viewer3DRetrieveRevealRevisionEndpoint = (
  modelId: CogniteInternalId,
  revisionId: CogniteInternalId
) => Promise<RevealRevision3D>;

export type Viewer3DListRevealNodes3DEndpoint = (
  modelId: CogniteInternalId,
  revisionId: CogniteInternalId,
  query?: List3DNodesQuery
) => CogniteAsyncIterator<RevealNode3D>;

export type Viewer3DListRevealNodeAncestorsEndpoint = (
  modelId: CogniteInternalId,
  revisionId: CogniteInternalId,
  nodeId: CogniteInternalId,
  query?: List3DNodesQuery
) => CogniteAsyncIterator<RevealNode3D>;

export type Viewer3DListRevealSectorsEndpoint = (
  modelId: CogniteInternalId,
  revisionId: CogniteInternalId,
  query?: ListRevealSectors3DQuery
) => CogniteAsyncIterator<RevealSector3D>;

export type Viewer3DRetrieveUnrealRevisionEndpoint = (
  modelId: CogniteInternalId,
  revisionId: CogniteInternalId
) => Promise<RevealRevision3D>;

function parameterizePath(
  project: string,
  modelId: CogniteInternalId,
  revisionId: CogniteInternalId,
  unreal: boolean = false
) {
  const type3D = unreal ? 'unreal' : 'reveal';
  return `${projectUrl(
    project
  )}/3d/${type3D}/models/${modelId}/revisions/${revisionId}`;
}
