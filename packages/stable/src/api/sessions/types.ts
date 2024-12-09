import type { EpochTimestamp, FilterQuery } from '../../types';

export type SessionStatus =
  | 'READY'
  | 'ACTIVE'
  | 'CANCELLED'
  | 'EXPIRED'
  | 'REVOKED'
  | 'ACCESS_LOST';

export const SessionStatus = {
  READY: 'READY' as SessionStatus,
  ACTIVE: 'ACTIVE' as SessionStatus,
  CANCELLED: 'CANCELLED' as SessionStatus,
  EXPIRED: 'EXPIRED' as SessionStatus,
  REVOKED: 'REVOKED' as SessionStatus,
  ACCESS_LOST: 'ACCESS_LOST' as SessionStatus,
};

export type SessionType =
  | 'CLIENT_CREDENTIALS'
  | 'TOKEN_EXCHANGE'
  | 'ONESHOT_TOKEN_EXCHANGE';

export const SessionType = {
  CLIENT_CREDENTIALS: 'CLIENT_CREDENTIALS' as SessionType,
  TOKEN_EXCHANGE: 'TOKEN_EXCHANGE' as SessionType,
  ONESHOT_TOKEN_EXCHANGE: 'ONESHOT_TOKEN_EXCHANGE' as SessionType,
};

/**
* A response with the ID, nonce and other information related to the session. The nonce
is short-lived and should be immediately passed to the endpoint that will use
the session.
*/
export interface SessionCreateResponseItem {
  /** ID of the session */
  id: number;
  /** Client ID in identity provider. Returned only if the session was created using client credentials */
  clientId?: string;
  /** Nonce to be passed to the internal service that will bind the session */
  nonce: string;
  /** Current status of the session */
  status: SessionStatus;
  /** Values reserved for future use */
  type?: SessionType;
}

/**
 * Credentials for a session using client credentials from an identity provider.
 */
export interface SessionWithClientCredentialsCreate {
  /** Client ID in identity provider */
  clientId: string;
  /** Client secret in identity provider */
  clientSecret: string;
}
/**
* Credentials for a session using one-shot token exchange to reuse the user's credentials.
One-shot sessions are short-lived sessions that are not refreshed and do not require support for token exchange from the identity provider.
*/
export interface SessionWithOneshotTokenExchangeCreate {
  /** Use one-shot token exchange for the session. Must be `true`. */
  oneshotTokenExchange: true;
}
/**
 * Credentials for a session using token exchange to reuse the user's credentials.
 */
export interface SessionWithTokenExchangeCreate {
  /** Use token exchange for the session. Must be `true`. */
  tokenExchange: true;
}

export type SessionCreate =
  | SessionWithClientCredentialsCreate
  | SessionWithTokenExchangeCreate
  | SessionWithOneshotTokenExchangeCreate;

export interface SessionFilter {
  /** Current status of the session */
  status?:
    | 'READY'
    | 'ACTIVE'
    | 'CANCELLED'
    | 'EXPIRED'
    | 'REVOKED'
    | 'ACCESS_LOST';
}

export interface SessionFilterQuery extends FilterQuery {
  filter?: SessionFilter;
}

export interface Session {
  /** ID of the session */
  id?: number;
  /** Client ID in identity provider. Returned only if the session was created using client credentials */
  clientId?: string;
  /** Session creation time, in milliseconds since 1970 */
  creationTime?: EpochTimestamp;
  /** Session expiry time, in milliseconds since 1970. This value is updated on refreshing a token */
  expirationTime?: EpochTimestamp;
  /** Current status of the session */
  status?: SessionStatus;
  /** Values reserved for future use */
  type?: SessionType;
}
