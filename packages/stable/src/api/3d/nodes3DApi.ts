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
 * @deprecated Asset-centric API, to be retired end of 2027. May move to `client.legacy` in the next major release. See https://docs.cognite.com/cdf/deprecated#deprecated-and-retired-features for more details.
 */
export class Nodes3DAPI extends BaseResourceAPI<Node3D> {
  /**
   * @deprecated Asset-centric API, to be retired end of 2027. May move to `client.legacy` in the next major release.
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
   * @deprecated Asset-centric API, to be retired end of 2027. May move to `client.legacy` in the next major release.
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
   * @deprecated Asset-centric API, to be retired end of 2027. May move to `client.legacy` in the next major release.
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
   * @deprecated Asset-centric API, to be retired end of 2027. May move to `client.legacy` in the next major release.
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
