// Copyright 2022 Cognite AS

import {
  BaseResourceAPI,
  CDFHttpClient,
  IdEither,
  MetadataMap,
} from '@cognite/sdk-core';
import {
  Subscriber,
  SubscriberCreate,
  SubscriberFilterQuery,
} from './types';

export class SubscribersAPI extends BaseResourceAPI<Subscriber> {
  constructor(...args: [string, CDFHttpClient, MetadataMap]) {
    super(...args);
  }

  public create = async (items: SubscriberCreate[]) => {
    return this.createEndpoint(items);
  };

  public list = async (filter?: SubscriberFilterQuery) => {
    return this.listEndpoint<SubscriberFilterQuery>(
      this.callListEndpointWithPost,
      filter
    );
  };

  public delete = async (ids: IdEither[]) => {
    return this.deleteEndpoint(ids);
  };
}
