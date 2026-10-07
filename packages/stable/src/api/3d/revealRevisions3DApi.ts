// Copyright 2020 Cognite AS

import { BaseResourceAPI } from '@cognite/sdk-core';
import type { CogniteInternalId, RevealRevision3D } from '../../types';

export class RevealRevisions3DAPI extends BaseResourceAPI<RevealRevision3D> {
  /**
   * @hidden
   */
  protected getDateProps() {
    return this.pickDateProps(['items'], ['createdTime']);
  }

  public async retrieve(
    modelId: CogniteInternalId,
    revisionId: CogniteInternalId
  ): Promise<RevealRevision3D> {
    const path = this.url(`models/${modelId}/revisions/${revisionId}`);
    const response = await this.get<RevealRevision3D>(path);
    return this.addToMapAndReturn(response.data, response);
  }
}
