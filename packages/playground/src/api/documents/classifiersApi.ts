// Copyright 2020 Cognite AS

import {
  BaseResourceAPI,
  CogniteInternalId,
  CursorAndAsyncIterator,
  InternalId,
  ItemsWrapper,
} from '@cognite/sdk-core';
import { Classifier, ClassifierName } from '../../types';

export class ClassifiersAPI extends BaseResourceAPI<Classifier> {
  public create = (classifiers: ClassifierName[]): Promise<Classifier[]> => {
    return this.createEndpoint(classifiers);
  };

  public list = (): CursorAndAsyncIterator<Classifier> => {
    return this.listEndpoint(this.callListEndpointWithGet, {});
  };

  public listByIds = (
    ids: CogniteInternalId[],
    ignoreUnknownIds: boolean = false
  ): Promise<ItemsWrapper<Classifier[]>> => {
    return this.classifiersListByIds<ItemsWrapper<Classifier[]>>(
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
    ignoreUnknownIds?: boolean
  ): Promise<ResponseType> {
    const internalIds = ids.map(id => ({ id }));
    const response = await this.post<ResponseType>(this.url(), {
      data: {
        items: internalIds,
        ignoreUnknownIds,
      },
    });
    return this.addToMapAndReturn(response.data, response);
  }
}
