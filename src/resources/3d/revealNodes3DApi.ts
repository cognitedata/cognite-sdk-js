// Copyright 2019 Cognite AS

import { CursorAndAsyncIterator } from '@/standardMethods';
import {
  CogniteInternalId,
  List3DNodesQuery,
  RevealNode3D,
} from '@/types/types';
import { BaseResourceAPI } from '../baseResourceApi';

export class RevealNodes3DAPI extends BaseResourceAPI<RevealNode3D> {
  public list(
    modelId: CogniteInternalId,
    revisionId: CogniteInternalId,
    scope?: List3DNodesQuery
  ): CursorAndAsyncIterator<RevealNode3D> {
    const path = this.encodeUrl(modelId, revisionId);
    return super.listEndpoint(
      params => this.httpClient.get(path, { params }),
      scope
    );
  }

  public listAncestors(
    modelId: CogniteInternalId,
    revisionId: CogniteInternalId,
    nodeId: CogniteInternalId,
    scope?: List3DNodesQuery
  ): CursorAndAsyncIterator<RevealNode3D> {
    const path = this.encodeUrl(modelId, revisionId) + `/${nodeId}/ancestors`;
    return super.listEndpoint(
      params => this.httpClient.get(path, { params }),
      scope
    );
  }

  private encodeUrl(modelId: CogniteInternalId, revisionId: CogniteInternalId) {
    return this.url(`models/${modelId}/revisions/${revisionId}/nodes`);
  }
}
