// Copyright 2026 Cognite AS

import {
  BaseResourceAPI,
  type CursorAndAsyncIterator,
  type InternalId,
} from '@cognite/sdk-core';
import type {
  TransformationNotification,
  TransformationNotificationCreate,
  TransformationNotificationListQuery,
} from './types';

export class TransformationNotificationsAPI extends BaseResourceAPI<TransformationNotification> {
  /**
   * [Subscribe for notifications](https://api-docs.cognite.com/20230101/tag/Transformation-Notifications/operation/createTransformationNotifications)
   *
   * Subscribes email addresses to errors of transformations.
   *
   * ```js
   * const notifications = await client.transformations.notifications.create([
   *   { transformationExternalId: 'my-transformation', destination: 'me@example.com' },
   *   { transformationId: 123, destination: 'team@example.com' },
   * ]);
   * ```
   */
  public create = (
    items: TransformationNotificationCreate[]
  ): Promise<TransformationNotification[]> => {
    return this.createEndpoint(items);
  };

  /**
   * [List notification subscriptions](https://api-docs.cognite.com/20230101/tag/Transformation-Notifications/operation/getTransformationNotifications)
   *
   * ```js
   * const notifications = await client.transformations.notifications
   *   .list({ transformationExternalId: 'my-transformation' })
   *   .autoPagingToArray({ limit: 100 });
   * ```
   */
  public list = (
    query?: TransformationNotificationListQuery
  ): CursorAndAsyncIterator<TransformationNotification> => {
    return this.listEndpoint(this.callListEndpointWithGet, query);
  };

  /**
   * [Delete notification subscriptions by notification ID](https://api-docs.cognite.com/20230101/tag/Transformation-Notifications/operation/deleteTransformationNotifications)
   *
   * Deleting a subscription that does not exist does nothing.
   *
   * ```js
   * await client.transformations.notifications.delete([{ id: 123 }]);
   * ```
   */
  public delete = (ids: InternalId[]): Promise<object> => {
    return this.deleteEndpoint(ids);
  };
}
