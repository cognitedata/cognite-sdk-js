// Copyright 2019 Cognite AS

import { CogniteInternalId, RevealRevision3D } from '@/types/types';
import { BaseResourceAPI } from '../baseResourceApi';

export class RevealRevisions3DAPI extends BaseResourceAPI<RevealRevision3D> {
  public async retrieve(
    modelId: CogniteInternalId,
    revisionId: CogniteInternalId
  ): Promise<RevealRevision3D> {
    const path = this.url(`models/${modelId}/revisions/${revisionId}`);
    const response = await this.httpClient.get<RevealRevision3D>(path);
    return this.addToMapAndReturn(response.data, response);
  }
}
