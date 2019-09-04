// Copyright 2019 Cognite AS

import { CursorAndAsyncIterator } from '@/autoPagination';
import { BaseResourceAPI } from '@/resources/baseResourceApi';
import {
  CogniteInternalId,
  CursorResponse,
  List3DNodesQuery,
  Node3D,
} from '@/types/types';

export class Nodes3DAPI extends BaseResourceAPI<Node3D> {
  public list(
    modelId: CogniteInternalId,
    revisionId: CogniteInternalId,
    scope?: List3DNodesQuery
  ): CursorAndAsyncIterator<Node3D> {
    const path = this.url(`${modelId}/revisions/${revisionId}/nodes`);
    return super.listEndpoint(
      params => this.httpClient.get<CursorResponse<Node3D[]>>(path, { params }),
      scope
    );
  }

  public listAncestors(
    modelId: CogniteInternalId,
    revisionId: CogniteInternalId,
    nodeId: CogniteInternalId,
    scope?: List3DNodesQuery
  ): CursorAndAsyncIterator<Node3D> {
    const path = this.url(
      `${modelId}/revisions/${revisionId}/nodes/${nodeId}/ancestors`
    );
    return super.listEndpoint(
      params => this.httpClient.get<CursorResponse<Node3D[]>>(path, { params }),
      scope
    );
  }
}
