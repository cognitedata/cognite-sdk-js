import { HttpRequestOptions } from '@cognite/sdk-core';
import { BasicHttpClient } from '@cognite/sdk-core';
import { bearerTokenString, RefreshToken } from './clientAuthUtils';

export default class HttpClientWithIntercept extends BasicHttpClient {
  private authenticatingWithToken: boolean = false;
  private refreshToken: RefreshToken = () => '';

  public set setReauthenticateMethod(method: RefreshToken) {
    this.refreshToken = method;
  }

  constructor(baseUrl: string) {
    super(baseUrl);
  }

  public set setIfUsingLoginToken(bool: boolean) {
    this.authenticatingWithToken = bool;
  }

  public get usesTokenLogin() {
    return this.authenticatingWithToken;
  }

  private updateHeaderWithNewToken(token: string) {
    this.setDefaultHeader('Authorization', bearerTokenString(token));
  }

  /**
   * Basic HTTP method for GET
   *
   * @param path The URL path
   * @param options Request options, optional
   *
   */
  public asyncGet = <T = any>(path: string, options?: HttpRequestOptions) => {
    return this.get<T>(path, options).catch(err => {
      // if unauthorized unathorized 401 or forbbiden 403 occurs, try again with a new header
      if ((err.status === 401 || err.status === 403) && this.usesTokenLogin) {
        // update with new bearer token
        const newToken = this.refreshToken();
        this.updateHeaderWithNewToken(newToken);

        // try again
        return this.get<T>(path, options);
      }

      // rethrow
      throw err;
    });
  };

  /**
   * Basic HTTP method for PUT
   *
   * @param path The URL path
   * @param options Request options, optional
   *
   */
  public asyncPut = <T = any>(path: string, options?: HttpRequestOptions) => {
    return this.put<T>(path, options).catch(err => {
      // if unauthorized unathorized 401 or forbbiden 403 occurs, try again with a new header
      if ((err.status === 401 || err.status === 403) && this.usesTokenLogin) {
        // update with new bearer token
        const newToken = this.refreshToken();
        this.updateHeaderWithNewToken(newToken);

        // try again
        return this.put<T>(path, options);
      }

      // rethrow
      throw err;
    });
  };

  /**
   * Basic HTTP method for POST
   *
   * @param path The URL path
   * @param options Request options, optional
   *
   */
  public asyncPost = <T = any>(path: string, options?: HttpRequestOptions) => {
    return this.post<T>(path, options).catch(err => {
      // if unauthorized unathorized 401 or forbbiden 403 occurs, try again with a new header
      if ((err.status === 401 || err.status === 403) && this.usesTokenLogin) {
        // update with new bearer token
        const newToken = this.refreshToken();
        this.updateHeaderWithNewToken(newToken);

        // try again
        return this.post<T>(path, options);
      }

      // rethrow
      throw err;
    });
  };

  /**
   * Basic HTTP method for DELETE
   *
   * @param path The URL path
   * @param options Request options, optional
   */
  public asyncDelete = <T = any>(
    path: string,
    options?: HttpRequestOptions
  ) => {
    return this.delete<T>(path, options).catch(err => {
      // if unauthorized unathorized 401 or forbbiden 403 occurs, try again with a new header
      if ((err.status === 401 || err.status === 403) && this.usesTokenLogin) {
        // update with new bearer token
        const newToken = this.refreshToken();
        this.updateHeaderWithNewToken(newToken);

        // try again
        return this.delete<T>(path, options);
      }

      // rethrow
      throw err;
    });
  };

  /**
   * Basic HTTP method for PATCH
   *
   * @param path The URL path
   * @param options Request options, optional
   */
  public asyncPatch = <T = any>(path: string, options?: HttpRequestOptions) => {
    return this.patch<T>(path, options).catch(err => {
      // if unauthorized unathorized 401 or forbbiden 403 occurs, try again with a new header
      if ((err.status === 401 || err.status === 403) && this.usesTokenLogin) {
        // update with new bearer token
        const newToken = this.refreshToken();
        this.updateHeaderWithNewToken(newToken);

        // try again
        return this.patch<T>(path, options);
      }

      // rethrow
      throw err;
    });
  };
}
