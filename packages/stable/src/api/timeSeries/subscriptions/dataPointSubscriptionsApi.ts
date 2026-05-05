// Copyright 2026 Cognite AS

import {
  BaseResourceAPI,
  type CDFHttpClient,
  type MetadataMap,
} from '@cognite/sdk-core';
import cloneDeepWith from 'lodash/cloneDeepWith';
import type {
  DataPointSubscription,
  DataPointSubscriptionByIdsQuery,
  DataPointSubscriptionListDataQuery,
  DataPointSubscriptionListDataResponse,
  DataPointSubscriptionListQuery,
  DataPointSubscriptionListResponse,
  DataPointSubscriptionMembersListQuery,
  DataPointSubscriptionMembersListResponse,
  DataPointSubscriptionUpdate,
  DataPointSubscriptionsDeleteQuery,
  DataPointSubscriptionCreate,
} from './types';

function parseSubscriptionListDataDates(
  data: DataPointSubscriptionListDataResponse
): DataPointSubscriptionListDataResponse {
  return cloneDeepWith(data, (value, key) => {
    if (
      (key === 'timestamp' ||
        key === 'inclusiveBegin' ||
        key === 'exclusiveEnd') &&
      (typeof value === 'number' || typeof value === 'string')
    ) {
      return new Date(value);
    }
  });
}

export class DataPointSubscriptionsAPI extends BaseResourceAPI<DataPointSubscription> {
  /** @hidden */
  constructor(...args: [string, CDFHttpClient, MetadataMap]) {
    super(...args);
  }

  /**
   * @hidden
   */
  protected getDateProps() {
    return this.pickDateProps(['items'], ['createdTime', 'lastUpdatedTime']);
  }

  /**
   * [Create data point subscriptions](https://docs.cognite.com/api/v1/#operation/postSubscriptions)
   */
  public create = async (
    items: DataPointSubscriptionCreate[]
  ): Promise<DataPointSubscription[]> => {
    const responses = await Promise.all(
      items.map((item) =>
        this.post<{ items: DataPointSubscription[] }>(this.url(), {
          data: { items: [item] },
        })
      )
    );
    return responses.flatMap((response) =>
      this.addToMapAndReturn(response.data.items, response)
    );
  };

  /**
   * [List data point subscriptions](https://docs.cognite.com/api/v1/#operation/listSubscriptions)
   */
  public list = async (
    query?: DataPointSubscriptionListQuery
  ): Promise<DataPointSubscriptionListResponse> => {
    const response = await this.get<DataPointSubscriptionListResponse>(
      this.url(),
      { params: query }
    );
    return this.addToMapAndReturn(response.data, response);
  };

  /**
   * [Retrieve data point subscriptions](https://docs.cognite.com/api/v1/#operation/getSubscriptionsByIds)
   */
  public retrieve = async (
    query: DataPointSubscriptionByIdsQuery
  ): Promise<DataPointSubscription[]> => {
    const { items, ...rest } = query;
    const responses = await Promise.all(
      items.map((item) =>
        this.post<{ items: DataPointSubscription[] }>(this.url('byids'), {
          data: { items: [item], ...rest },
        })
      )
    );
    return responses.flatMap((response) =>
      this.addToMapAndReturn(response.data.items, response)
    );
  };

  /**
   * [Update data point subscriptions](https://docs.cognite.com/api/v1/#operation/updateSubscriptions)
   */
  public update = async (
    items: DataPointSubscriptionUpdate[]
  ): Promise<DataPointSubscription[]> => {
    const responses = await Promise.all(
      items.map((item) =>
        this.post<{ items: DataPointSubscription[] }>(this.url('update'), {
          data: { items: [item] },
        })
      )
    );
    return responses.flatMap((response) =>
      this.addToMapAndReturn(response.data.items, response)
    );
  };

  /**
   * [Delete data point subscriptions](https://docs.cognite.com/api/v1/#operation/deleteSubscriptions)
   */
  public delete = async (
    query: DataPointSubscriptionsDeleteQuery
  ): Promise<void> => {
    const { items, ignoreUnknownIds } = query;
    await Promise.all(
      items.map((item) =>
        this.post(this.url('delete'), {
          data: { items: [item], ignoreUnknownIds },
        })
      )
    );
  };

  /**
   * [List data point subscription members](https://docs.cognite.com/api/v1/#operation/listSubscriptionMembers)
   */
  public listMembers = async (
    query: DataPointSubscriptionMembersListQuery
  ): Promise<DataPointSubscriptionMembersListResponse> => {
    const response =
      await this.get<DataPointSubscriptionMembersListResponse>(
        this.url('members'),
        { params: query }
      );
    return this.addToMapAndReturn(response.data, response);
  };

  /**
   * [List data point subscription data](https://docs.cognite.com/api/v1/#operation/listSubscriptionData)
   */
  public listData = async (
    query: DataPointSubscriptionListDataQuery
  ): Promise<DataPointSubscriptionListDataResponse> => {
    const response = await this.post<DataPointSubscriptionListDataResponse>(
      this.url('data/list'),
      {
        data: query,
      }
    );
    const parsed = parseSubscriptionListDataDates(response.data);
    return this.addToMapAndReturn(parsed, response);
  };
}
