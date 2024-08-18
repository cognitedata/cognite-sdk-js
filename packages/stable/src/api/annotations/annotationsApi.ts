// Copyright 2022 Cognite AS

import {
  BaseResourceAPI,
  type CogniteAsyncIterator,
  type CursorAndAsyncIterator,
  type CursorResponse,
  type InternalId,
  type ListResponse,
} from '@cognite/sdk-core';

import type {
  AnnotationChangeById,
  AnnotationCreate,
  AnnotationFilterRequest,
  AnnotationModel,
  AnnotationReverseLookupRequest,
  AnnotationSuggest,
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
   * ```js
   * const data = {
   *   pageNumber: 7,
   *   textRegion: { xMin: 0, xMax: 0.1, yMin: 0, yMax: 0.2 },
   *   extractedText: 'i am your father',
   * };
   * const annotation = {
   *   annotatedResourceType: 'file' as const,
   *   annotatedResourceId: 1,
   *   annotationType: 'documents.ExtractedText',
   *   creatingApp: 'integration-tests',
   *   creatingAppVersion: '0.0.1',
   *   creatingUser: 'integration-tests',
   *   status: 'suggested' as const,
   *   data,
   * };
   * const created = await client.annotations.create([annotation]);
   * ```
   */
  public create = (items: AnnotationCreate[]) => {
    return this.createEndpoint(items);
  };

  /**
   * [Suggest annotations](https://docs.cognite.com/api/playground/#operation/annotationsSuggest)
   *
   * ```js
   * const data = {
   *   pageNumber: 7,
   *   textRegion: { xMin: 0, xMax: 0.1, yMin: 0, yMax: 0.2 },
   *   extractedText: 'i am your father',
   * };
   * const partial = {
   *   annotatedResourceType: 'file' as const,
   *   annotatedResourceId: 1,
   *   annotationType: 'documents.ExtractedText',
   *   creatingApp: 'integration-tests',
   *   creatingAppVersion: '0.0.1',
   *   creatingUser: 'integration-tests',
   *   data,
   * };
   *
   * const created = await client.annotations.suggest([partial]);
   * ```
   */
  public suggest = (items: AnnotationSuggest[]) => {
    return this.createEndpoint(items, this.suggestUrl);
  };

  /**
   * [Retrieve](https://docs.cognite.com/api/playground/#operation/annotationsByids)
   * or [Get an](https://docs.cognite.com/api/playground/#operation/annotationsGet)
   * annotation
   *
   * ```js
   * const annotationIds = [{ id: 1 }, { id: 2 }];
   *
   * const response = await client.annotations.retrieve(annotationIds);
   * ```
   */
  public retrieve = (ids: InternalId[]) => {
    return this.retrieveEndpoint(ids);
  };

  /**
   * [Advanced list of annotations](https://docs.cognite.com/api/playground/#operation/annotationsFilter)
   *
   * ```js
   * const annotatedFileId = 1;
   * const limitOne = await client.annotations.list({
   *   limit: 1,
   *   filter: {
   *    annotatedResourceType: 'file',
   *    annotatedResourceIds: [{ id: 1 }],
   *  },
   * });
   * ```
   */
  public list = (
    filter: AnnotationFilterRequest,
  ): CursorAndAsyncIterator<AnnotationModel> => {
    return this.listEndpoint(this.callListEndpointWithPost, filter);
  };

  /**
   * [Delete annotations](https://docs.cognite.com/api/playground/#operation/annotationsDelete)
   *
   * ```js
   * const annotationIds = [{ id: 1 }, { id: 2 }];
   * await client.annotations.delete(annotationIds);
   * ```
   */
  public delete = (ids: InternalId[]) => {
    return this.deleteEndpoint(ids);
  };

  /**
   * [Update annotations](https://docs.cognite.com/api/playground/#operation/annotationsUpdate)
   *
   * ```js
   * const data = {
   *   pageNumber: 8,
   *   fileRef: { externalId: 'def_file_changed' },
   *   textRegion: { xMin: 0, xMax: 0.1, yMin: 0, yMax: 0.2 },
   * };
   * const changes = [
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
   * ```
   */
  public update = (changes: AnnotationChangeById[]) => {
    return this.updateEndpoint(changes);
  };

  /**
   * [Reverse lookup](https://developer.cognite.com/api/v1-beta/#tag/Annotations/operation/annotationsReverseLookup)
   *
   * ```js
   * const assetQueryData = {
   *   limit: -1,
   *   filter: {
   *     annotatedResourceType: 'file' as const,
   *     annotationType: 'images.AssetLink',
   *     data: {
   *       assetRef: { id: 123 }
   *     }
   *   }
   * };
   * const resourceIdsResponse = client.annotations.reverseLookup(assetQueryData);
   * ```
   */
  public reverseLookup = (
    filter: AnnotationReverseLookupRequest,
  ): Promise<ListResponse<AnnotationsAssetRef[]>> &
    CogniteAsyncIterator<AnnotationsAssetRef> => {
    const path = this.url('reverselookup');
    return this.cursorBasedEndpoint(
      (params) =>
        this.post<CursorResponse<AnnotationsAssetRef[]>>(path, {
          data: params,
        }),
      filter,
    );
  };
}
