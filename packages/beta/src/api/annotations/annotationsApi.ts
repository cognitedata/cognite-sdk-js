import {
  CogniteAsyncIterator,
  CursorResponse,
  ListResponse,
} from '@cognite/sdk-core';
import { AnnotationsAssetRef } from '@cognite/sdk-stable';
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
  ): Promise<ListResponse<AnnotationsAssetRef[]>> &
    CogniteAsyncIterator<AnnotationsAssetRef> => {
    const path = this.url(`reverselookup`);
    return this.cursorBasedEndpoint(
      (params) =>
        this.post<CursorResponse<AnnotationsAssetRef[]>>(path, {
          data: params,
        }),
      filter
    );
  };
}
