// Copyright 2020 Cognite AS

import {
  BaseResourceAPI,
  CogniteInternalId,
  CursorAndAsyncIterator,
  InternalId,
} from '@cognite/sdk-core';
import {
  DocumentsClassifier,
  DocumentsClassifierListByIdsRequest,
  DocumentsClassifiersResponse,
  DocumentsClassifierCreate,
} from '../../types';

export class ClassifiersAPI extends BaseResourceAPI<DocumentsClassifier> {
  public create = (
    classifierConfigurations: DocumentsClassifierCreate[]
  ): Promise<DocumentsClassifier[]> => {
    return this.createEndpoint(classifierConfigurations);
  };

  public list = (): CursorAndAsyncIterator<DocumentsClassifier> => {
    return this.listEndpoint(this.callListEndpointWithGet, {});
  };

  public listByIds = (
    ids: CogniteInternalId[],
    ignoreUnknownIds: boolean = false
  ): Promise<DocumentsClassifiersResponse> => {
    return this.classifiersListByIds<DocumentsClassifiersResponse>(
      ids,
      ignoreUnknownIds
    );
  };

  public delete = (ids: InternalId[], ignoreUnknownIds: boolean = false) => {
    return this.deleteEndpoint(ids, {
      ignoreUnknownIds,
    });
  };

  private async classifiersListByIds<ResponseType>(
    ids: CogniteInternalId[],
    ignoreUnknownIds: boolean
  ): Promise<ResponseType> {
    const request: DocumentsClassifierListByIdsRequest = {
      items: ids.map((id) => ({ id })),
      ignoreUnknownIds,
    };
    const response = await this.post<ResponseType>(this.url('byids'), {
      data: request,
    });
    return this.addToMapAndReturn(response.data, response);
  }
}
