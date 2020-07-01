// Copyright 2020 Cognite AS

import { BaseResourceAPI } from '@cognite/sdk-core';
import {
  CogniteInternalId,
  RevealRevision3D,
  DatePropFilter,
} from '../../types';

export class UnrealRevisions3DAPI extends BaseResourceAPI<RevealRevision3D> {
  /**
   * Specify what fields in json responses should be parsed as Dates
   * @hidden
   */
  protected getDateProps(): DatePropFilter {
    return [['items'], ['createdTime']];
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
