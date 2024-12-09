import {
  BaseResourceAPI,
  type InternalId,
  type ItemsResponse,
  type ItemsWrapper,
} from '@cognite/sdk-core';
import type {
  Session,
  SessionCreate,
  SessionCreateResultItem,
  SessionFilterQuery,
} from './types';

export class SessionsApi extends BaseResourceAPI<Session> {
  /**
   * [Create a session](https://api-docs.cognite.com/20230101/tag/Sessions/operation/createSessions)
   *
   * ```js
   * client.sessions.create([{ clientId: 'client-id', clientSecret: 'client-secret' }])
   * ```
   * */
  public create = async (
    items: SessionCreate[]
  ): Promise<SessionCreateResultItem[]> => {
    const response = await this.post<ItemsWrapper<SessionCreateResultItem[]>>(
      this.url(),
      { data: { items } }
    );
    return response.data.items;
  };

  /**
   * [List sessions](https://api-docs.cognite.com/20230101/tag/Sessions/operation/listSessions)
   *
   * ```js
   * client.sessions.list({ filter: { status: 'ACTIVE' } })
   * ```
   */
  public list = (query?: SessionFilterQuery) => {
    const { filter, ...rest } = query || {};
    return this.listEndpoint(this.callListEndpointWithGet, {
      ...rest,
      ...filter,
    });
  };

  /**
   * [Retrieve sessions with given IDs](https://api-docs.cognite.com/20230101/tag/Sessions/operation/getSessionsByIds)
   *
   * ```js
   * client.sessions.retrieve([{ id: 1 }])
   * ```
   */
  public retrieve = (ids: InternalId[]) => {
    return this.retrieveEndpoint(ids);
  };

  /**
   * [Revoke access to a session](https://api-docs.cognite.com/20230101/tag/Sessions/operation/revokeSessions)
   *
   * ```js
   * client.sessions.revoke([{ id: 1 }])
   * ```
   */
  async revoke(ids: InternalId[]) {
    const url = this.url('revoke');
    const res = await this.post<ItemsResponse<Session>>(url, {
      data: { items: ids },
    });
    return res.data.items;
  }
}
