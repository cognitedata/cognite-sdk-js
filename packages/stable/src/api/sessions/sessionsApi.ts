import {
  BaseResourceAPI,
  type CDFHttpClient,
  type MetadataMap,
} from '@cognite/sdk-core';
import type {
  CreateSessionRequestList,
  CreateSessionResponseList,
  Session,
  SessionList,
  SessionReferenceIds,
} from './types.gen';

export class SessionsApi extends BaseResourceAPI<Session> {
  private baseUrl: string;
  constructor(...args: [string, CDFHttpClient, MetadataMap]) {
    super(...args);

    const [baseUrl, _httpClient, _map] = args;
    this.baseUrl = baseUrl;
  }

  /** 
   * [Create a session](https://api-docs.cognite.com/20230101/tag/Sessions/operation/createSessions)
   * 
   * ```js
   * client.sessions.create({
   *    items: [{ tokenExchange: true }],
   *  })
   * ```
   * */
  async create(request: CreateSessionRequestList) {
    return await this.post<CreateSessionResponseList>(this.baseUrl, {
      data: request,
    });
  }

  /**
   * [List sessions](https://api-docs.cognite.com/20230101/tag/Sessions/operation/listSessions)
   * 
   * ```js
   * client.sessions.list({ status: 'ACTIVE' })
   * ```
   */
  async list(params: { status?: string; cursor?: string; limit?: number }) {
    return await this.get<SessionList>(`${this.baseUrl}`, { params });
  }

  /**
   * [Retrieve sessions with given IDs](https://api-docs.cognite.com/20230101/tag/Sessions/operation/getSessionsByIds)
   * 
   * ```js
   * client.sessions.retrieve({ items: [{ id: 1 }] })
   * ```
   */
  async retrieve(scope: SessionReferenceIds) {
    return await this.post<SessionList>(`${this.baseUrl}/byids`, {
      data: scope,
    });
  }

  /**
   * [Revoke access to a session](https://api-docs.cognite.com/20230101/tag/Sessions/operation/revokeSessions)
   * 
   * ```js
   * client.sessions.revoke({ items: [{ id: 1 }] })
   * ```
   */
  async revoke(scope: SessionReferenceIds) {
    return await this.post<SessionList>(`${this.baseUrl}/revoke`, {
      data: scope,
    });
  }
}
