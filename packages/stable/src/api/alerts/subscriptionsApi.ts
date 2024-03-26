// Copyright 2022 Cognite AS

import { BaseResourceAPI, CDFHttpClient, MetadataMap } from '@cognite/sdk-core';
import {
  Subscription,
  SubscriptionCreate,
  SubscriptionDelete,
  SubscriptionFilterQuery,
} from './types';

export class SubscriptionsAPI extends BaseResourceAPI<Subscription> {
  constructor(...args: [string, CDFHttpClient, MetadataMap]) {
    super(...args);
  }

  public create = async (items: SubscriptionCreate[]) => {
    return this.createEndpoint(items);
  };

  public delete = async (items: SubscriptionDelete[]) => {
    return this.deleteEndpoint(items);
  };

  public list = async (filter?: SubscriptionFilterQuery) => {
    return this.listEndpoint<SubscriptionFilterQuery>(
      this.callListEndpointWithPost,
      filter
    );
  };
}
