import {
  BaseResourceAPI,
  type CDFHttpClient,
  type MetadataMap,
} from '@cognite/sdk-core';
import {
  type CreateSessionRequestList,
  type CreateSessionResponseList,
  type Session,
  type SessionList,
  type SessionReferenceIds
} from './types.gen';

export class SessionsApi extends BaseResourceAPI<Session> {
  private baseUrl: string;
  constructor(...args: [string, CDFHttpClient, MetadataMap]) {
    super(...args);

    const [baseUrl, _httpClient, _map] = args;
    this.baseUrl = baseUrl;
  }
  
  /** Sessions are used to maintain access to CDF resources
   * for an extended period of time.
   *
   * The methods available to extend a sessions lifetime
   * are client credentials and token exchange.
   *
   * Sessions depend on the project OIDC configuration and may
   * become invalid in the following cases 
   * 
   * Example:
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
   * List all sessions in the current project.
   */
  async list(params: { status?: string; cursor?: string; limit?: number }) {
    return await this.get<SessionList>(`${this.baseUrl}`, { params });
  }

  /**
   * List of session IDs to retrieve
   */
  async retrieve(scope: SessionReferenceIds) {
    return await this.post<SessionList>(`${this.baseUrl}/byids`, {
      data: scope,
    });
  }

  /**
   * Revoke access to a session.
   * Revocation is idempotent.
   * Revocation of a session may in some cases take up to 1 hour to take effect.
   */
  async revoke(scope: SessionReferenceIds) {
    return await this.post<SessionList>(`${this.baseUrl}/revoke`, {
      data: scope,
    });
  }
}
