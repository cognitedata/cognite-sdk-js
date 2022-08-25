// Copyright 2022 Cognite AS

import {
  BaseResourceAPI,
  CursorAndAsyncIterator,
  InternalId,
} from '@cognite/sdk-core';

import {
  AnnotationChangeById,
  AnnotationCreate,
  AnnotationSuggest,
  AnnotationFilterRequest,
  AnnotationModel,
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
   */
  public create = (items: AnnotationCreate[]) => {
    return this.createEndpoint(items);
  };

  /**
   * [Suggest annotations](https://docs.cognite.com/api/playground/#operation/annotationsSuggest)
   * 
   * const created = await client.annotations.create(annotations);
   */
  public suggest = (items: AnnotationSuggest[]) => {
    return this.createEndpoint(items, this.suggestUrl);
  };

  /**
   * [Retrieve](https://docs.cognite.com/api/playground/#operation/annotationsByids)
   * or [Get an](https://docs.cognite.com/api/playground/#operation/annotationsGet)
   * annotation
   * 
   * const response = await client.annotations.retrieve(createdAnnotationIds);
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
   * await client.annotations.delete(createdAnnotationIds);
   */
  public delete = (ids: InternalId[]) => {
    return this.deleteEndpoint(ids);
  };

  /**
   * [Update annotations](https://docs.cognite.com/api/playground/#operation/annotationsUpdate)
   * 
   * const updatedResp = await client.annotations.update(changes);
   */
  public update = (changes: AnnotationChangeById[]) => {
    return this.updateEndpoint(changes);
  };
}
