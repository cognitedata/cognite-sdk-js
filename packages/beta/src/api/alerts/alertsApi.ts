// Copyright 2022 Cognite AS
import {
  BaseResourceAPI,
  CDFHttpClient,
  CursorAndAsyncIterator,
  MetadataMap,
} from '@cognite/sdk-core';
import { IdEither } from '@cognite/sdk';
import {
  Alert,
  AlertCreate,
  AlertFilterQuery,
  ChannelChange,
  ChannelCreate,
  ChannelFilterQuery,
  SubscriberCreate,
  SubscriberFilterQuery,
  SubscriptionCreate,
  SubscriptionDelete,
  SubscriptionFilterQuery,
} from '../../types';
import { ChannelsAPI } from './channelsApi';
import { SubscribersAPI } from './subscribersApi';
import { SubscriptionsAPI } from './subscriptionsApi';

export class AlertsAPI extends BaseResourceAPI<Alert> {
  private channelsApi: ChannelsAPI;
  private subscribersApi: SubscribersAPI;
  private subscriptionsApi: SubscriptionsAPI;

  constructor(...args: [string, CDFHttpClient, MetadataMap]) {
    super(...args);

    const [resourcePath, client, metadataMap] = args;

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
    return this.createEndpoint(items);
  };

  public list = (query?: AlertFilterQuery): CursorAndAsyncIterator<Alert> => {
    return this.listEndpoint(this.callListEndpointWithPost, query);
  };

  public close = async (items: IdEither[]) => {
    const res = await this.post<{}>(this.url('close'), {
      data: {
        items,
      },
    });
    return this.addToMapAndReturn(res.data, res);
  };

  public listChannels = async (filter?: ChannelFilterQuery) => {
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

  public listSubscribers = async (filter?: SubscriberFilterQuery) => {
    return this.subscribersApi.list(filter);
  };

  public deleteSubscribers = async (items: IdEither[]) => {
    return this.subscribersApi.delete(items);
  };

  public createSubscriptions = async (items: SubscriptionCreate[]) => {
    return this.subscriptionsApi.create(items);
  };

  public listSubscriptions = async (filter?: SubscriptionFilterQuery) => {
    return this.subscriptionsApi.list(filter);
  };

  public deleteSubscription = async (items: SubscriptionDelete[]) => {
    return this.subscriptionsApi.delete(items);
  };
}
