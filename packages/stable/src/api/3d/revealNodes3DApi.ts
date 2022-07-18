// Copyright 2020 Cognite AS

import { BaseResourceAPI, CursorAndAsyncIterator } from '@cognite/sdk-core';
import { CogniteInternalId, List3DNodesQuery, RevealNode3D } from '../../types';

export class RevealNodes3DAPI extends BaseResourceAPI<RevealNode3D> {

  /**
   * [List 3D nodes (Reveal)](https://doc.cognitedata.com/api/v1/#operation/revealGet3DNodes)
   *
   * ```js
   * const nodes3dReveal = await client.revealNodes3DAPI
   *  .list(8252999965991682, 4190022127342195)
   *  .autoPagingToArray();
   * ```
   */
  public list(
    modelId: CogniteInternalId,
    revisionId: CogniteInternalId,
    scope?: List3DNodesQuery
  ): CursorAndAsyncIterator<RevealNode3D> {
    const path = this.encodeUrl(modelId, revisionId);
    return super.listEndpoint((params) => this.get(path, { params }), scope);
  }

  /**
   * [List 3D ancestor nodes (Reveal)](https://doc.cognitedata.com/api/v1/#operation/revealGet3DNodeAncestors)
   *
   * ```js
   * const ancestorsReveal = await client.revealNodes3DAPI
   *  .listAncestors(8252999965991682, 4190022127342195, 120982398890213)
   *  .autoPagingToArray();
   * ```
   */
  public listAncestors(
    modelId: CogniteInternalId,
    revisionId: CogniteInternalId,
    nodeId: CogniteInternalId,
    scope?: List3DNodesQuery
  ): CursorAndAsyncIterator<RevealNode3D> {
    const path = this.encodeUrl(modelId, revisionId) + `/${nodeId}/ancestors`;
    return super.listEndpoint((params) => this.get(path, { params }), scope);
  }

  private encodeUrl(modelId: CogniteInternalId, revisionId: CogniteInternalId) {
    return this.url(`models/${modelId}/revisions/${revisionId}/nodes`);
  }
}
