// Copyright 2020 Cognite AS

import { BaseResourceAPI } from '@cognite/sdk-core';
import { CogniteInternalId, UnrealRevision3D } from '../../types';

export class UnrealRevisions3DAPI extends BaseResourceAPI<UnrealRevision3D> {
  /**
   * @hidden
   */
  protected getDateProps() {
    return this.pickDateProps(['items'], ['createdTime']);
  }

  /**
   * [Retrieve a 3D revision (Unreal)](https://doc.cognitedata.com/api/v1/#operation/getUnreal3DRevision)
   *
   * ```js
   * const revisions3DUnreal = await client.viewer3D.retrieve(8252999965991682, 4190022127342195);
   * ```
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
