import { BaseResourceAPI, CDFHttpClient, MetadataMap } from '@cognite/sdk-core';
import {
  Subscription,
  SubscriptionCreate,
  SubscriptionDelete,
} from '../../types';

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
}
