import { HttpRequestOptions } from '@cognite/sdk-core';
import { BasicHttpClient } from '@cognite/sdk-core';

export default class HttpClientWithIntercept extends BasicHttpClient {
  private authenticatingWithToken: boolean = false;

  constructor(baseUrl: string) {
    super(baseUrl);
  }

  public set setIfUsingLoginToken(bool: boolean) {
    this.authenticatingWithToken = bool;
  }

  public get usesTokenLogin() {
    return this.authenticatingWithToken;
  }

  /**
   * Basic HTTP method for GET
   *
   * @param path The URL path
   * @param options Request options, optional
   *
   */
  public asyncGet = <T = any>(path: string, options?: HttpRequestOptions) => {
    return this.get<T>(path, options)
      .then(response => response)
      .catch(err => {
        // if unauthorized unathorized 401 or forbbiden 403 occurs, try again with a new header
        if ((err.status === 401 || err.status === 403) && this.usesTokenLogin) {
          //console.log('found err in get: ', err);
          return this.get<T>(path, options);
        }
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
    return this.put<T>(path, options)
      .then(response => response)
      .catch(err => {
        // if unauthorized unathorized 401 or forbbiden 403 occurs, try again with a new header
        if ((err.status === 401 || err.status === 403) && this.usesTokenLogin) {
          //console.log('found err in post: ', err);
          return this.put<T>(path, options);
        }
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
    return this.post<T>(path, options)
      .then(response => response)
      .catch(err => {
        // if unauthorized unathorized 401 or forbbiden 403 occurs, try again with a new header
        if ((err.status === 401 || err.status === 403) && this.usesTokenLogin) {
          //console.log('found err in post: ', err);
          return this.post<T>(path, options);
        }
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
    return this.delete<T>(path, options)
      .then(response => response)
      .catch(err => {
        // if unauthorized unathorized 401 or forbbiden 403 occurs, try again with a new header
        if ((err.status === 401 || err.status === 403) && this.usesTokenLogin) {
          //console.log('found err in post: ', err);
          return this.delete<T>(path, options);
        }
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
    return this.patch<T>(path, options)
      .then(response => response)
      .catch(err => {
        // if unauthorized unathorized 401 or forbbiden 403 occurs, try again with a new header
        if ((err.status === 401 || err.status === 403) && this.usesTokenLogin) {
          //console.log('found err in post: ', err);
          return this.patch<T>(path, options);
        }
        throw err;
      });
  };
}
