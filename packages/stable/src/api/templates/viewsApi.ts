import {
  BaseResourceAPI,
  type CursorAndAsyncIterator,
  type CursorResponse,
  type ExternalId,
} from '@cognite/sdk-core';
import type {
  ExternalView,
  View,
  ViewFilterQuery,
  ViewResolveRequest,
} from '../../types';

/**
 * @deprecated Asset-centric API, to be retired end of 2027. Will move to `client.legacy` in the next major release. See https://docs.cognite.com/cdf/deprecated#deprecated-and-retired-features for more details.
 */
export class ViewsApi extends BaseResourceAPI<View> {
  /**
   * @deprecated Asset-centric API, to be retired end of 2027. Will move to `client.legacy` in the next major release.
   */
  public create = (items: ExternalView[]): Promise<View[]> => {
    return this.createEndpoint(items);
  };

  /**
   * @deprecated Asset-centric API, to be retired end of 2027. Will move to `client.legacy` in the next major release.
   */
  public upsert = (items: ExternalView[]): Promise<View[]> => {
    return this.createEndpoint(items, this.url('upsert'));
  };

  /**
   * @deprecated Asset-centric API, to be retired end of 2027. Will move to `client.legacy` in the next major release.
   */
  public list = (query?: ViewFilterQuery): CursorAndAsyncIterator<View> => {
    return this.listEndpoint(this.callListEndpointWithPost, query);
  };

  /**
   * @deprecated Asset-centric API, to be retired end of 2027. Will move to `client.legacy` in the next major release.
   */
  public resolve = <T>(
    resolveRequest: ViewResolveRequest
  ): CursorAndAsyncIterator<T> => {
    const resolveFetch = async (filter?: ViewResolveRequest) => {
      const response = await this.post<CursorResponse<ResponseType[]>>(
        this.url('resolve'),
        {
          data: filter || {},
        }
      );
      return response;
    };
    return this.listEndpoint(
      // biome-ignore lint/suspicious/noExplicitAny: didn't manage to type this properly within reasonable time
      resolveFetch as any,
      resolveRequest
    ) as unknown as CursorAndAsyncIterator<T>;
  };

  /**
   * @deprecated Asset-centric API, to be retired end of 2027. Will move to `client.legacy` in the next major release.
   */
  public delete = (
    ids: ExternalId[],
    options?: { ignoreUnknownIds: boolean }
  ) => {
    return super.deleteEndpoint(
      ids,
      options || {
        ignoreUnknownIds: false,
      }
    );
  };
}
