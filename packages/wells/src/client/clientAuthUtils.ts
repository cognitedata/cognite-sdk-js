export interface ClientLoginOptions {
  appId: string;
  baseUrl?: string;
}

export interface CogniteProject {
  /**
   * Cognite project to login into
   */
  project: string;
}

export interface ApiKeyLogin extends CogniteProject {
  /**
   * A Cognite issued api-key
   */
  apiKey: string;
}

export interface TokenLogin extends CogniteProject {
  /**
   * Provide optional cached access token to skip the authentication flow (client.authenticate will still override this).
   */
  accessToken: string;
}
/** @hidden */

export interface Tokens {
  accessToken: string;
  idToken: string;
}

export type WithTokens = (tokens: Tokens) => void;
/** @hidden */

export function bearerTokenString(token: string) {
  return `Bearer ${token}`;
}
/** @hidden */

export function isUsingBrowser() {
  return (
    typeof window !== 'undefined' && typeof window.document !== 'undefined'
  );
}
/** @hidden */

export function isUsingSSL() {
  return isUsingBrowser() && location.protocol.toLowerCase() === 'https:';
}

export function accessWellsApi<T>(api: T | undefined): T {
  if (api === undefined) {
    throw Error(
      'Need to login with either loginWithApiKey or loginWithToken before you can use the Cognite Wells SDK'
    );
  }
  return api;
}
