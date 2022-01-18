// Copyright 2022 Cognite AS

import {
  BaseResourceAPI,
  CursorAndAsyncIterator,
  InternalId,
} from '@cognite/sdk-core';

import {
  AnnotationChangeById,
  AnnotationCreate,
  AnnotationFilterRequest,
  AnnotationModel,
} from './types';

export class AnnotationsAPI extends BaseResourceAPI<AnnotationModel> {
  /**
   * Specify that dates should be parsed in requests and responses
   * @hidden
   */
  protected getDateProps() {
    return this.pickDateProps(['items'], ['createdTime', 'lastUpdatedTime']);
  }

  /**
   * [Create annotations](https://docs.cognite.com/api/playground/#operation/annotationsCreate)
   */
  public create = (items: AnnotationCreate[]) => {
    return this.createEndpoint(items);
  };

  /**
   * [Retrieve](https://docs.cognite.com/api/playground/#operation/annotationsByids)
   * or [Get an](https://docs.cognite.com/api/playground/#operation/annotationsGet)
   * annotation
   */
  public retrieve = (ids: InternalId[]) => {
    return this.retrieveEndpoint(ids);
  };

  public list = (
    filter: AnnotationFilterRequest
  ): CursorAndAsyncIterator<AnnotationModel> => {
    return this.listEndpoint(this.callListEndpointWithPost, filter);
  };

  /**
   * [Delete annotations](https://docs.cognite.com/api/playground/#operation/annotationsDelete)
   */
  public delete = (ids: InternalId[]) => {
    return this.deleteEndpoint(ids);
  };

  /**
   * [Update annotations](https://docs.cognite.com/api/playground/#operation/annotationsUpdate)
   */
  public update = (changes: AnnotationChangeById[]) => {
    return this.updateEndpoint(changes);
  };
}
