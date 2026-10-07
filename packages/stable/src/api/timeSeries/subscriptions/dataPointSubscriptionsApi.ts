// Copyright 2026 Cognite AS

import {
  BaseResourceAPI,
  type CursorAndAsyncIterator,
  type CursorResponse,
} from '@cognite/sdk-core';
import cloneDeepWith from 'lodash/cloneDeepWith';
import type {
  DataPointSubscription,
  DataPointSubscriptionByIdsQuery,
  DataPointSubscriptionCreate,
  DataPointSubscriptionListDataQuery,
  DataPointSubscriptionListDataResponse,
  DataPointSubscriptionListQuery,
  DataPointSubscriptionMember,
  DataPointSubscriptionMembersListQuery,
  DataPointSubscriptionUpdate,
  DataPointSubscriptionsDeleteQuery,
} from './types';

/**
 * @deprecated Asset-centric API, to be retired end of 2027. Will move to `client.legacy.timeseries` in the next major release. See https://github.com/cognitedata/cognite-sdk-js/blob/master/guides/DEPRECATIONS.md for details.
 */
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
   *
   * @deprecated Asset-centric API, to be retired end of 2027. Will move to `client.legacy.timeseries` in the next major release.
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
   *
   * @deprecated Asset-centric API, to be retired end of 2027. Will move to `client.legacy.timeseries` in the next major release.
   */
  public list = (
    query?: DataPointSubscriptionListQuery
  ): CursorAndAsyncIterator<DataPointSubscription> => {
    return super.listEndpoint(this.callListEndpointWithGet, query);
  };

  /**
   * [Retrieve data point subscriptions](https://docs.cognite.com/api/v1/#operation/getSubscriptionsByIds)
   *
   * ```js
   * const subscriptions = await client.timeseries.subscriptions.retrieve({
   *   items: [{ externalId: 'my_subscription' }],
   * });
   * ```
   *
   * @deprecated Asset-centric API, to be retired end of 2027. Will move to `client.legacy.timeseries` in the next major release.
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
   *
   * @deprecated Asset-centric API, to be retired end of 2027. Will move to `client.legacy.timeseries` in the next major release.
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
   *
   * @deprecated Asset-centric API, to be retired end of 2027. Will move to `client.legacy.timeseries` in the next major release.
   */
  public delete = async (
    query: DataPointSubscriptionsDeleteQuery
  ): Promise<void> => {
    const { items, ignoreUnknownIds } = query;
    await this.callDeleteEndpoint(
      items,
      { ignoreUnknownIds },
      this.url('delete')
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
  private callListMembersEndpointWithGet = async (
    scope?: DataPointSubscriptionMembersListQuery
  ) => {
    return this.get<CursorResponse<DataPointSubscriptionMember[]>>(
      this.url('members'),
      { params: scope }
    );
  };

  /**
   * @deprecated Asset-centric API, to be retired end of 2027. Will move to `client.legacy.timeseries` in the next major release.
   */
  public listMembers = (
    query: DataPointSubscriptionMembersListQuery
  ): CursorAndAsyncIterator<DataPointSubscriptionMember> => {
    return this.cursorBasedEndpoint(this.callListMembersEndpointWithGet, query);
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
   *
   * @deprecated Asset-centric API, to be retired end of 2027. Will move to `client.legacy.timeseries` in the next major release.
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
