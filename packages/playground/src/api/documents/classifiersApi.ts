// Copyright 2020 Cognite AS

import {
  BaseResourceAPI,
  type CogniteInternalId,
  type CursorAndAsyncIterator,
  type InternalId,
} from '@cognite/sdk-core';
import type {
  DocumentsClassifier,
  DocumentsClassifierCreate,
  DocumentsClassifierListByIdsRequest,
  DocumentsClassifiersResponse,
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
    ignoreUnknownIds = false
  ): Promise<DocumentsClassifiersResponse> => {
    return this.#classifiersListByIds<DocumentsClassifiersResponse>(
      ids,
      ignoreUnknownIds
    );
  };

  public delete = (ids: InternalId[], ignoreUnknownIds = false) => {
    return this.deleteEndpoint(ids, {
      ignoreUnknownIds,
    });
  };

  async #classifiersListByIds<ResponseType extends object>(
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
    return this.addToMapAndReturn<ResponseType, unknown>(
      response.data,
      response
    );
  }
}
