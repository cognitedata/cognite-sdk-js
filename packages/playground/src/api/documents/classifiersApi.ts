// Copyright 2020 Cognite AS

import {
  BaseResourceAPI,
  CursorAndAsyncIterator,
  InternalId,
  ItemsWrapper,
} from '@cognite/sdk-core';
import { Classifier } from '../../types';

export class ClassifiersAPI extends BaseResourceAPI<Classifier> {
  public create = (classifiers: Classifier[]): Promise<Classifier[]> => {
    return this.createEndpoint(classifiers);
  };

  public list = (): CursorAndAsyncIterator<Classifier> => {
    return this.listEndpoint(this.callListEndpointWithGet, {});
  };

  public listByIds = (
    ids: InternalId[],
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
    ids: InternalId[],
    ignoreUnknownIds?: boolean
  ): Promise<ResponseType> {
    const documentIds = ids.map(id => ({ id }));
    const response = await this.post<ResponseType>(this.url(), {
      data: {
        items: documentIds,
        ignoreUnknownIds,
      },
    });
    return this.addToMapAndReturn(response.data, response);
  }
}
