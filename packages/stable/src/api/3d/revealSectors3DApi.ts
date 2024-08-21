// Copyright 2020 Cognite AS

import {
  BaseResourceAPI,
  type CursorAndAsyncIterator,
} from '@cognite/sdk-core';
import type {
  CogniteInternalId,
  ListRevealSectors3DQuery,
  RevealSector3D,
} from '../../types';

export class RevealSectors3DAPI extends BaseResourceAPI<RevealSector3D> {
  public list(
    modelId: CogniteInternalId,
    revisionId: CogniteInternalId,
    scope?: ListRevealSectors3DQuery
  ): CursorAndAsyncIterator<RevealSector3D> {
    const path = this.url(`models/${modelId}/revisions/${revisionId}/sectors`);
    return super.listEndpoint((params) => this.get(path, { params }), scope);
  }
}
