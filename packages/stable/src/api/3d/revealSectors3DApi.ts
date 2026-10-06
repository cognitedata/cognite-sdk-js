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

/**
 * @deprecated Asset-centric API, to be retired end of 2027. May move to `client.legacy` in the next major release. See https://docs.cognite.com/cdf/deprecated#deprecated-and-retired-features for more details.
 */
export class RevealSectors3DAPI extends BaseResourceAPI<RevealSector3D> {
  /**
   * @deprecated Asset-centric API, to be retired end of 2027. May move to `client.legacy` in the next major release.
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
