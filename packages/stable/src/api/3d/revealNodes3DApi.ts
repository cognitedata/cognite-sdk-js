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

export class RevealNodes3DAPI extends BaseResourceAPI<RevealNode3D> {
  public list(
    modelId: CogniteInternalId,
    revisionId: CogniteInternalId,
    scope?: List3DNodesQuery
  ): CursorAndAsyncIterator<RevealNode3D> {
    const path = this.#encodeUrl(modelId, revisionId);
    return super.listEndpoint((params) => this.get(path, { params }), scope);
  }

  public listAncestors(
    modelId: CogniteInternalId,
    revisionId: CogniteInternalId,
    nodeId: CogniteInternalId,
    scope?: List3DNodesQuery
  ): CursorAndAsyncIterator<RevealNode3D> {
    const path = `${this.#encodeUrl(modelId, revisionId)}/${nodeId}/ancestors`;
    return super.listEndpoint((params) => this.get(path, { params }), scope);
  }

  #encodeUrl(modelId: CogniteInternalId, revisionId: CogniteInternalId) {
    return this.url(`models/${modelId}/revisions/${revisionId}/nodes`);
  }
}
