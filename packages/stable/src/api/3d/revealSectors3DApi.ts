// Copyright 2020 Cognite AS

import { BaseResourceAPI, CursorAndAsyncIterator } from '@cognite/sdk-core';
import {
  CogniteInternalId,
  ListRevealSectors3DQuery,
  RevealSector3D,
} from '../../types';

export class RevealSectors3DAPI extends BaseResourceAPI<RevealSector3D> {

  /**
   * [List 3D sectors (Reveal)](https://doc.cognitedata.com/api/v1/#operation/revealGet3DSectors)
   *
   * ```js
   * const sectors3D = await client.revealSectors3DAPI
   *  .list(8252999965991682, 4190022127342195, { limit: 10 })
   *  .autoPagingToArray();
   * ```
   */
  public list(
    modelId: CogniteInternalId,
    revisionId: CogniteInternalId,
    scope?: ListRevealSectors3DQuery
  ): CursorAndAsyncIterator<RevealSector3D> {
    const path = this.url(`models/${modelId}/revisions/${revisionId}/sectors`);
    return super.listEndpoint((params) => this.get(path, { params }), scope);
  }
}
