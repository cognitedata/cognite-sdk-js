// Copyright 2020 Cognite AS

import {
  BaseResourceAPI,
  type CursorAndAsyncIterator,
} from '@cognite/sdk-core';
import type {
  CogniteInternalId,
  List3DNodesQuery,
  RevealNode3D,
} from '../../types';

/**
 * @deprecated Asset-centric API, to be retired end of 2027. May move to `client.legacy` in the next major release. See https://docs.cognite.com/cdf/deprecated#deprecated-and-retired-features for more details.
 */
export class RevealNodes3DAPI extends BaseResourceAPI<RevealNode3D> {
  /**
   * @deprecated Asset-centric API, to be retired end of 2027. May move to `client.legacy` in the next major release.
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
   * @deprecated Asset-centric API, to be retired end of 2027. May move to `client.legacy` in the next major release.
   */
  public listAncestors(
    modelId: CogniteInternalId,
    revisionId: CogniteInternalId,
    nodeId: CogniteInternalId,
    scope?: List3DNodesQuery
  ): CursorAndAsyncIterator<RevealNode3D> {
    const path = `${this.encodeUrl(modelId, revisionId)}/${nodeId}/ancestors`;
    return super.listEndpoint((params) => this.get(path, { params }), scope);
  }

  private encodeUrl(modelId: CogniteInternalId, revisionId: CogniteInternalId) {
    return this.url(`models/${modelId}/revisions/${revisionId}/nodes`);
  }
}
