// Copyright 2020 Cognite AS

import { BaseResourceAPI } from '@haved/cogsdk-core';
import { CogniteInternalId, RevealRevision3D } from '../../types';

export class UnrealRevisions3DAPI extends BaseResourceAPI<RevealRevision3D> {
  public async retrieve(
    modelId: CogniteInternalId,
    revisionId: CogniteInternalId
  ): Promise<RevealRevision3D> {
    const path = this.url(`models/${modelId}/revisions/${revisionId}`);
    const response = await this.httpClient.get<RevealRevision3D>(path);
    return this.addToMapAndReturn(response.data, response);
  }
}
