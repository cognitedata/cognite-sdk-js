// Copyright 2022 Cognite AS

import {
  BaseResourceAPI,
  CogniteAsyncIterator,
  CursorAndAsyncIterator,
  CursorResponse,
  InternalId,
  ListResponse,
} from '@cognite/sdk-core';

import {
  AnnotationChangeById,
  AnnotationCreate,
  AnnotationSuggest,
  AnnotationFilterRequest,
  AnnotationReverseLookupRequest,
  AnnotationModel,
  AnnotationsAssetRef,
} from '../../types';

export class AnnotationsAPI extends BaseResourceAPI<AnnotationModel> {
  /**
   * Specify that dates should be parsed in requests and responses
   * @hidden
   */
  protected getDateProps() {
    return this.pickDateProps(['items'], ['createdTime', 'lastUpdatedTime']);
  }

  protected get suggestUrl() {
    return this.url('suggest');
  }

  /**
   * [Create annotations](https://docs.cognite.com/api/playground/#operation/annotationsCreate)
   *
   * const data = {
   *   pageNumber: 7,
   *   textRegion: { xMin: 0, xMax: 0.1, yMin: 0, yMax: 0.2 },
   *   extractedText: 'i am your father',
   * };
   * const partial: AnnotationCreate = {
   *   annotatedResourceType: 'file',
   *   annotatedResourceId: 1,
   *   annotationType: 'documents.ExtractedText',
   *   creatingApp: 'integration-tests',
   *   creatingAppVersion: '0.0.1',
   *   creatingUser: 'integration-tests',
   *   status: 'suggested',
   *   data,
   * };
   *
   * const created = await client.annotations.create([partial]);
   *
   */
  public create = (items: AnnotationCreate[]) => {
    return this.createEndpoint(items);
  };

  /**
   * [Suggest annotations](https://docs.cognite.com/api/playground/#operation/annotationsSuggest)
   *
   * const data = {
   *   pageNumber: 7,
   *   textRegion: { xMin: 0, xMax: 0.1, yMin: 0, yMax: 0.2 },
   *   extractedText: 'i am your father',
   * };
   * const partial: AnnotationSuggest = {
   *   annotatedResourceType: 'file',
   *   annotatedResourceId: 1,
   *   annotationType: 'documents.ExtractedText',
   *   creatingApp: 'integration-tests',
   *   creatingAppVersion: '0.0.1',
   *   creatingUser: 'integration-tests',
   *   data,
   * };
   *
   * const created = await client.annotations.suggest([partial]);
   */
  public suggest = (items: AnnotationSuggest[]) => {
    return this.createEndpoint(items, this.suggestUrl);
  };

  /**
   * [Retrieve](https://docs.cognite.com/api/playground/#operation/annotationsByids)
   * or [Get an](https://docs.cognite.com/api/playground/#operation/annotationsGet)
   * annotation
   *
   * const annotationIds: InternalId[] = [1,2];
   *
   * const response = await client.annotations.retrieve(annotationIds);
   */
  public retrieve = (ids: InternalId[]) => {
    return this.retrieveEndpoint(ids);
  };

  /**
   * [Advanced list of annotations](https://docs.cognite.com/api/playground/#operation/annotationsFilter)
   *
   * const limitOne = await client.annotations.list({
   *   limit: 1,
   *   filter: fileFilter(annotatedFileId),
   * });
   *
   */
  public list = (
    filter: AnnotationFilterRequest
  ): CursorAndAsyncIterator<AnnotationModel> => {
    return this.listEndpoint(this.callListEndpointWithPost, filter);
  };

  /**
   * [Delete annotations](https://docs.cognite.com/api/playground/#operation/annotationsDelete)
   *
   * const annotationIds: InternalId[] = [1,2];
   *
   * await client.annotations.delete(annotationIds);
   */
  public delete = (ids: InternalId[]) => {
    return this.deleteEndpoint(ids);
  };

  /**
   * [Update annotations](https://docs.cognite.com/api/playground/#operation/annotationsUpdate)
   *
   * const data = {
   *   pageNumber: 8,
   *   fileRef: { externalId: 'def_file_changed' },
   *   textRegion: { xMin: 0, xMax: 0.1, yMin: 0, yMax: 0.2 },
   * };
   * const changes: AnnotationChangeById[] = [
   *   {
   *     id: 1,
   *     update: {
   *       data: {
   *         set: data,
   *       },
   *     },
   *   },
   * ];
   *
   * const updatedResp = await client.annotations.update(changes);
   */
  public update = (changes: AnnotationChangeById[]) => {
    return this.updateEndpoint(changes);
  };

  /**
   * [Reverse lookup](https://developer.cognite.com/api/v1-beta/#tag/Annotations/operation/annotationsReverseLookup)
   * const assetQueryData = {
   *   limit: -1,
   *   filter: {
   *     annotatedResourceType: 'file',
   *     annotationType: 'images.AssetLink',
   *     data: {
   *       assetRef: { id: 123 }
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
    console.log('Aaaaaaah, in reverse lookup');
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
