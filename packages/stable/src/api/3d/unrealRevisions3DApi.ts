// Copyright 2020 Cognite AS

import { BaseResourceAPI } from '@cognite/sdk-core';
import type { CogniteInternalId, UnrealRevision3D } from '../../types';

export class UnrealRevisions3DAPI extends BaseResourceAPI<UnrealRevision3D> {
  /**
   * @hidden
   */
  protected getDateProps() {
    return this.pickDateProps(['items'], ['createdTime']);
  }

  public async retrieve(
    modelId: CogniteInternalId,
    revisionId: CogniteInternalId
  ): Promise<UnrealRevision3D> {
    const path = this.url(`models/${modelId}/revisions/${revisionId}`);
    const response = await this.get<UnrealRevision3D>(path);
    return this.addToMapAndReturn(response.data, response);
  }
}
