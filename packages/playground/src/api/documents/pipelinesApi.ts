// Copyright 2020 Cognite AS

import {
  BaseResourceAPI,
  CursorAndAsyncIterator,
  ExternalId,
} from '@cognite/sdk-core';

import { DocumentsPipeline, UpdateDocumentsPipeline } from './pipelinesTypes';

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
    changes: UpdateDocumentsPipeline[]
  ): Promise<DocumentsPipeline[]> => {
    return this.updateEndpoint<UpdateDocumentsPipeline>(changes);
  };

  public delete = (ids: ExternalId[]) => {
    return super.deleteEndpoint(ids);
  };
}
