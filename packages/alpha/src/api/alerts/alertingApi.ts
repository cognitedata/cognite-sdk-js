import { BaseResourceAPI, CDFHttpClient, MetadataMap } from '@cognite/sdk-core';
import { IdEither } from '@cognite/sdk';
import {
  Alert,
  AlertCreate,
  AlertFilter,
  ChannelChange,
  ChannelCreate,
  ChannelFilter,
  SubscriberCreate,
  SubscriptionCreate,
  SubscriptionDelete,
} from '../../types';
import { ChannelsAPI } from './channelsApi';
import { SubscribersAPI } from './subscribersApi';
import { SubscriptionsAPI } from './subscriptionsApi';
import { AlertsAPI } from './alertsApi';

export class AlertingAPI extends BaseResourceAPI<Alert> {
  private alertsApi: AlertsAPI;
  private channelsApi: ChannelsAPI;
  private subscribersApi: SubscribersAPI;
  private subscriptionsApi: SubscriptionsAPI;

  constructor(...args: [string, CDFHttpClient, MetadataMap]) {
    super(...args);

    const [resourcePath, client, metadataMap] = args;

    this.alertsApi = new AlertsAPI(
      `${resourcePath}/alerts`,
      client,
      metadataMap
    );
    this.channelsApi = new ChannelsAPI(
      `${resourcePath}/channels`,
      client,
      metadataMap
    );
    this.subscribersApi = new SubscribersAPI(
      `${resourcePath}/subscribers`,
      client,
      metadataMap
    );
    this.subscriptionsApi = new SubscriptionsAPI(
      `${resourcePath}/subscriptions`,
      client,
      metadataMap
    );
  }

  public create = async (items: AlertCreate[]) => {
    return this.alertsApi.create(items);
  };

  public list = async (filter?: AlertFilter) => {
    return this.alertsApi.list(filter);
  };

  public close = async (items: IdEither[]) => {
    return this.alertsApi.close(items);
  };

  public listChannels = async (filter?: ChannelFilter) => {
    return this.channelsApi.list(filter);
  };

  public createChannels = async (items: ChannelCreate[]) => {
    return this.channelsApi.create(items);
  };

  public deleteChannels = async (items: IdEither[]) => {
    return this.channelsApi.delete(items);
  };

  public updateChannels = async (items: ChannelChange[]) => {
    return this.channelsApi.update(items);
  };

  public createSubscribers = async (items: SubscriberCreate[]) => {
    return this.subscribersApi.create(items);
  };

  public createSubscriptions = async (items: SubscriptionCreate[]) => {
    return this.subscriptionsApi.create(items);
  };

  public deleteSubscription = async (items: SubscriptionDelete[]) => {
    return this.subscriptionsApi.delete(items);
  };
}
