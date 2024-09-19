// Copyright 2020 Cognite AS

import {
  BaseResourceAPI,
  type CDFHttpClient,
  type CursorAndAsyncIterator,
  type MetadataMap,
} from '@cognite/sdk-core';
import type {
  CogniteInternalId,
  List3DNodesQuery,
  ListRevealSectors3DQuery,
  RevealNode3D,
  RevealRevision3D,
  RevealSector3D,
} from '../../types';
import { RevealNodes3DAPI } from './revealNodes3DApi';
import { RevealRevisions3DAPI } from './revealRevisions3DApi';
import { RevealSectors3DAPI } from './revealSectors3DApi';
import { UnrealRevisions3DAPI } from './unrealRevisions3DApi';

export class Viewer3DAPI extends BaseResourceAPI<unknown> {
  #revealRevisions3DAPI: RevealRevisions3DAPI;
  #revealNodes3DAPI: RevealNodes3DAPI;
  #revealSectors3DAPI: RevealSectors3DAPI;
  #unrealRevisions3DAPI: UnrealRevisions3DAPI;
  /** @hidden */
  constructor(
    resourcePath: string,
    httpClient: CDFHttpClient,
    map: MetadataMap
  ) {
    super(resourcePath, httpClient, map);
    const revealPath = `${resourcePath}/reveal`;
    const unrealPath = `${resourcePath}/unreal`;
    this.#revealRevisions3DAPI = new RevealRevisions3DAPI(
      revealPath,
      httpClient,
      map
    );
    this.#revealNodes3DAPI = new RevealNodes3DAPI(revealPath, httpClient, map);
    this.#revealSectors3DAPI = new RevealSectors3DAPI(
      revealPath,
      httpClient,
      map
    );
    this.#unrealRevisions3DAPI = new UnrealRevisions3DAPI(
      unrealPath,
      httpClient,
      map
    );
  }

  /**
   * [Retrieve a 3D revision (Reveal)](https://doc.cognitedata.com/api/v1/#operation/getReveal3DRevision)
   *
   * ```js
   * const revisionReveal = await client.viewer3D.retrieveRevealRevision3D(294879032167592, 3247239473298342)
   * ```
   */
  public retrieveRevealRevision3D = (
    modelId: CogniteInternalId,
    revisionId: CogniteInternalId
  ): Promise<RevealRevision3D> => {
    return this.#revealRevisions3DAPI.retrieve(modelId, revisionId);
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
  public listRevealNodes3D = (
    modelId: CogniteInternalId,
    revisionId: CogniteInternalId,
    query?: List3DNodesQuery
  ): CursorAndAsyncIterator<RevealNode3D> => {
    return this.#revealNodes3DAPI.list(modelId, revisionId, query);
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
  public listRevealNode3DAncestors = (
    modelId: CogniteInternalId,
    revisionId: CogniteInternalId,
    nodeId: CogniteInternalId,
    query?: List3DNodesQuery
  ): CursorAndAsyncIterator<RevealNode3D> => {
    return this.#revealNodes3DAPI.listAncestors(
      modelId,
      revisionId,
      nodeId,
      query
    );
  };

  /**
   * [List 3D sectors (Reveal)](https://doc.cognitedata.com/api/v1/#operation/revealGet3DSectors)
   *
   * ```js
   * const sectors3D = await client.viewer3D
   *  .listRevealSectors3D(8252999965991682, 4190022127342195, { limit: 10 })
   *  .autoPagingToArray();
   * ```
   */
  public listRevealSectors3D = (
    modelId: CogniteInternalId,
    revisionId: CogniteInternalId,
    query?: ListRevealSectors3DQuery
  ): CursorAndAsyncIterator<RevealSector3D> => {
    return this.#revealSectors3DAPI.list(modelId, revisionId, query);
  };

  /**
   * [Retrieve a 3D revision (Unreal)](https://doc.cognitedata.com/api/v1/#operation/getUnreal3DRevision)
   *
   * ```js
   * const revisions3DUnreal = await client.viewer3D.retrieveUnrealRevision3D(8252999965991682, 4190022127342195);
   * ```
   */
  public retrieveUnrealRevision3D = (
    modelId: CogniteInternalId,
    revisionId: CogniteInternalId
  ): Promise<RevealRevision3D> => {
    return this.#unrealRevisions3DAPI.retrieve(modelId, revisionId);
  };
}
