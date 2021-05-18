// Copyright 2020 Cognite AS

import {
  BaseResourceAPI,
  CursorAndAsyncIterator,
  ExternalId,
} from '@cognite/sdk-core';

import { DocumentsPipeline } from '../../types';

export class PipelinesAPI extends BaseResourceAPI<DocumentsPipeline> {
  public create = (
    request: DocumentsPipeline[]
  ): Promise<DocumentsPipeline[]> => {
    return this.createEndpoint(request);
  };

  public list = (): CursorAndAsyncIterator<DocumentsPipeline> => {
    return super.listEndpoint(this.callListEndpointWithGet, {});
  };

  public update = (
    changes: DocumentsPipeline[]
  ): Promise<DocumentsPipeline[]> => {
    return this.updateEndpoint<DocumentsPipeline>(changes);
  };

  public delete = (ids: ExternalId[]) => {
    return super.deleteEndpoint(ids);
  };
}
