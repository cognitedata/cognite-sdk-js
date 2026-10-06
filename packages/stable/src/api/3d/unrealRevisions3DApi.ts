// Copyright 2020 Cognite AS

import { BaseResourceAPI } from '@cognite/sdk-core';
import type { CogniteInternalId, UnrealRevision3D } from '../../types';

/**
 * @deprecated Asset-centric API, to be retired end of 2027. May move to `client.legacy` in the next major release. See https://docs.cognite.com/cdf/deprecated#deprecated-and-retired-features for more details.
 */
export class UnrealRevisions3DAPI extends BaseResourceAPI<UnrealRevision3D> {
  /**
   * @hidden
   */
  protected getDateProps() {
    return this.pickDateProps(['items'], ['createdTime']);
  }

  /**
   * @deprecated Asset-centric API, to be retired end of 2027. May move to `client.legacy` in the next major release.
   */
  public async retrieve(
    modelId: CogniteInternalId,
    revisionId: CogniteInternalId
  ): Promise<UnrealRevision3D> {
    const path = this.url(`models/${modelId}/revisions/${revisionId}`);
    const response = await this.get<UnrealRevision3D>(path);
    return this.addToMapAndReturn(response.data, response);
  }
}
