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
  public create = (
    items: DataPointSubscriptionCreate[]
  ): Promise<DataPointSubscription[]> => {
    return this.createEndpoint(items, this.url());
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
  public retrieve = (
    query: DataPointSubscriptionByIdsQuery
  ): Promise<DataPointSubscription[]> => {
    const { items, ...params } = query;
    return this.callEndpointWithMergeAndTransform(items, (request) =>
      this.callRetrieveEndpoint(request, this.url('byids'), params)
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
  public update = (
    items: DataPointSubscriptionUpdate[]
  ): Promise<DataPointSubscription[]> => {
    return this.updateEndpoint(items, this.url('update'));
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
    await this.callDeleteEndpoint(items, { ignoreUnknownIds }, this.url('delete'));
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
