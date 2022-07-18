// Copyright 2020 Cognite AS

import { BaseResourceAPI, CursorAndAsyncIterator } from '@cognite/sdk-core';
import {
  CogniteInternalId,
  CursorResponse,
  InternalId,
  List3DNodesQuery,
  Filter3DNodesQuery,
  Node3D,
} from '../../types';

export class Nodes3DAPI extends BaseResourceAPI<Node3D> {
  /**
   * [List 3D nodes](https://doc.cognitedata.com/api/v1/#operation/get3DNodes)
   *
   * ```js
   * const nodes3d = await client.nodes3DApi.list(8252999965991682, 4190022127342195);
   * ```
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
   * [Filter 3D nodes](https://docs.cognite.com/api/v1/#operation/filter3DNodes)
   *
   * ```js
   * const query = {
   *  filter: {
   *    properties: {
   *      Items: {
   *        Type: ["Cylinder"]
   *      }
   *    }
   *  },
   *  partition: "1/10"
   * };
   * const nodes3d = await client.nodes3DApi.filter(8252999965991682, 4190022127342195, query);
   * ```
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
   * [Get 3D nodes by ID](https://docs.cognite.com/api/v1/#operation/get3DNodesById)
   *
   * ```js
   * const nodes3d = await client.nodes3DApi.retrieve(8252999965991682, 4190022127342195, [{id: 123}, {id: 456}]);
   * ```
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
   * [List 3D ancestor nodes](https://doc.cognitedata.com/api/v1/#operation/get3DNodeAncestors)
   *
   * ```js
   * const nodes3d = await client.nodes3DApi.listAncestors(8252999965991682, 4190022127342195, 572413075141081);
   * ```
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
