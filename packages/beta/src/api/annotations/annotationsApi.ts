import {
  CogniteAsyncIterator,
  CursorResponse,
  ListResponse,
  makeAutoPaginationMethods,
} from '@cognite/sdk-core';
import {
  AnnotatedResourceType,
  AnnotationsAssetRef,
} from '@cognite/sdk-stable';
import { AnnotationsAPI } from 'stable/src/api/annotations/annotationsApi';
import { AnnotationReverseLookupRequest } from '../../types';

export class BetaAnnotationsAPI extends AnnotationsAPI {
  /**
   * [Reverse lookup](https://developer.cognite.com/api/v1-beta/#tag/Annotations/operation/annotationsReverseLookup)
   * const assetQueryData = {
   *   limit: -1,
   *   filter: {
   *     annotatedResourceType: 'file',
   *     annotationType: 'images.AssetLink',
   *     data: {
   *       { id: 123 }
   *     }
   *   }
   * };
   *
   * const resourceIdsResponse = this._client.annotations.reverseLookup(assetQuerydata);
   */
  public reverseLookup = (
    filter: AnnotationReverseLookupRequest
  ): Promise<
    ListResponse<AnnotationsAssetRef[]> & {
      annotatedResourceType: AnnotatedResourceType;
    }
  > &
    CogniteAsyncIterator<AnnotationsAssetRef> => {
    const path = this.url(`reverselookup`);
    const endPointCaller = (params?: AnnotationReverseLookupRequest) =>
      this.post<
        CursorResponse<AnnotationsAssetRef[]> & {
          annotatedResourceType: AnnotatedResourceType;
        }
      >(path, {
        data: params,
      });

    const listPromise = endPointCaller(filter).then((transformedResponse) => {
      const pager = this.addNextPageFunction(
        endPointCaller.bind(this),
        transformedResponse.data,
        filter
      );
      return Object.assign(pager, {
        annotatedResourceType: transformedResponse.data.annotatedResourceType,
      });
    });
    const autoPaginationMethods = makeAutoPaginationMethods(listPromise);
    return Object.assign(listPromise, autoPaginationMethods);
  };
}
