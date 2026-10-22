// Copyright 2020 Cognite AS

import {
  BaseResourceAPI,
  type CursorAndAsyncIterator,
} from '@cognite/sdk-core';
import type {
  CogniteInternalId,
  CursorResponse,
  Filter3DNodesQuery,
  InternalId,
  List3DNodesQuery,
  Node3D,
} from '../../types';

/**
 * @deprecated Classic 3D API, deprecated 2026-10-15; no retirement date is announced. 3D models are managed through data modeling going forward. Will be removed or moved in a future major release. See https://docs.cognite.com/cdf/deprecated and https://github.com/cognitedata/cognite-sdk-js/blob/master/guides/DEPRECATIONS.md.
 */
export class Nodes3DAPI extends BaseResourceAPI<Node3D> {
  /**
   * @deprecated Classic 3D API, deprecated 2026-10-15; no retirement date is announced. 3D models are managed through data modeling going forward. Will be removed or moved in a future major release. See https://docs.cognite.com/cdf/deprecated and https://github.com/cognitedata/cognite-sdk-js/blob/master/guides/DEPRECATIONS.md.
   */
  public list(
    modelId: CogniteInternalId,
    revisionId: CogniteInternalId,
    scope?: List3DNodesQuery
  ): CursorAndAsyncIterator<Node3D> {
    const path = this.url(`${modelId}/revisions/${revisionId}/nodes`);
    return super.listEndpoint(
      (params) => this.get<CursorResponse<Node3D[]>>(path, { params }),
      scope
    );
  }

  /**
   * @deprecated Classic 3D API, deprecated 2026-10-15; no retirement date is announced. 3D models are managed through data modeling going forward. Will be removed or moved in a future major release. See https://docs.cognite.com/cdf/deprecated and https://github.com/cognitedata/cognite-sdk-js/blob/master/guides/DEPRECATIONS.md.
   */
  public filter(
    modelId: CogniteInternalId,
    revisionId: CogniteInternalId,
    scope?: Filter3DNodesQuery
  ): CursorAndAsyncIterator<Node3D> {
    const path = this.url(`${modelId}/revisions/${revisionId}/nodes/list`);
    return super.listEndpoint(
      (params) => this.post<CursorResponse<Node3D[]>>(path, { data: params }),
      scope
    );
  }

  /**
   * @deprecated Classic 3D API, deprecated 2026-10-15; no retirement date is announced. 3D models are managed through data modeling going forward. Will be removed or moved in a future major release. See https://docs.cognite.com/cdf/deprecated and https://github.com/cognitedata/cognite-sdk-js/blob/master/guides/DEPRECATIONS.md.
   */
  public retrieve = (
    modelId: CogniteInternalId,
    revisionId: CogniteInternalId,
    ids: InternalId[]
  ): Promise<Node3D[]> => {
    const path = this.url(`${modelId}/revisions/${revisionId}/nodes/byids`);
    return super.retrieveEndpoint(ids, {}, path);
  };

  /**
   * @deprecated Classic 3D API, deprecated 2026-10-15; no retirement date is announced. 3D models are managed through data modeling going forward. Will be removed or moved in a future major release. See https://docs.cognite.com/cdf/deprecated and https://github.com/cognitedata/cognite-sdk-js/blob/master/guides/DEPRECATIONS.md.
   */
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
      (params) => this.get<CursorResponse<Node3D[]>>(path, { params }),
      scope
    );
  }
}
