// Copyright 2026 Cognite AS

import { BaseResourceAPI } from '@cognite/sdk-core';
import cloneDeepWith from 'lodash/cloneDeepWith';
import type {
  DataPointSubscription,
  DataPointSubscriptionByIdsQuery,
  DataPointSubscriptionCreate,
  DataPointSubscriptionListDataQuery,
  DataPointSubscriptionListDataResponse,
  DataPointSubscriptionListQuery,
  DataPointSubscriptionListResponse,
  DataPointSubscriptionMembersListQuery,
  DataPointSubscriptionMembersListResponse,
  DataPointSubscriptionUpdate,
  DataPointSubscriptionsDeleteQuery,
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
  /**
   * @hidden
   */
  protected getDateProps() {
    return this.pickDateProps(['items'], ['createdTime', 'lastUpdatedTime']);
  }

  /**
   * [Create data point subscriptions](https://docs.cognite.com/api/v1/#operation/postSubscriptions)
   *
   * ```js
   * const subscriptions = await client.timeseries.subscriptions.create([
   *   { externalId: 'my_subscription', partitionCount: 1, timeSeriesIds: ['ts_external_id'] },
   * ]);
   * ```
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
   *
   * ```js
   * const subscriptions = await client.timeseries.subscriptions.list({ limit: 100 });
   * ```
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
   *
   * ```js
   * const subscriptions = await client.timeseries.subscriptions.retrieve({
   *   items: [{ externalId: 'my_subscription' }],
   * });
   * ```
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
   *
   * ```js
   * const updated = await client.timeseries.subscriptions.update([
   *   { externalId: 'my_subscription', update: { name: { set: 'new name' } } },
   * ]);
   * ```
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
   *
   * ```js
   * await client.timeseries.subscriptions.delete({
   *   items: [{ externalId: 'my_subscription' }],
   * });
   * ```
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
   *
   * ```js
   * const members = await client.timeseries.subscriptions.listMembers({
   *   externalId: 'my_subscription',
   *   limit: 100,
   * });
   * ```
   */
  public listMembers = async (
    query: DataPointSubscriptionMembersListQuery
  ): Promise<DataPointSubscriptionMembersListResponse> => {
    const response = await this.get<DataPointSubscriptionMembersListResponse>(
      this.url('members'),
      { params: query }
    );
    return this.addToMapAndReturn(response.data, response);
  };

  /**
   * [List data point subscription data](https://docs.cognite.com/api/v1/#operation/listSubscriptionData)
   *
   * ```js
   * const data = await client.timeseries.subscriptions.listData({
   *   externalId: 'my_subscription',
   *   partitions: [{ index: 0 }],
   *   limit: 100,
   *   initializeCursors: 'now',
   * });
   * ```
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
