// Copyright 2022 Cognite AS

import { BaseResourceAPI, type IdEither } from '@cognite/sdk-core';
import type {
  Subscriber,
  SubscriberCreate,
  SubscriberFilterQuery,
} from '../../types';

export class SubscribersAPI extends BaseResourceAPI<Subscriber> {
  public create = async (items: SubscriberCreate[]) => {
    return this.createEndpoint(items);
  };

  public list = async (filter?: SubscriberFilterQuery) => {
    return this.listEndpoint<SubscriberFilterQuery>(
      this.callListEndpointWithPost,
      filter,
    );
  };

  public delete = async (ids: IdEither[]) => {
    return this.deleteEndpoint(ids);
  };
}
