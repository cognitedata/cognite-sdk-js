// Copyright 2022 Cognite AS

import {
  BaseResourceAPI,
  CursorAndAsyncIterator,
  InternalId,
} from '@cognite/sdk-core';

import {
  AnnotationsV2CreateSchema,
  AnnotationsV2FilterSchema,
  AnnotationsV2ResponseSchema,
  AnnotationsV2SuggestSchema,
  AnnotationsV2UpdateDataSchema,
} from './types.gen';

export class AnnotationsAPI extends BaseResourceAPI<AnnotationsV2ResponseSchema> {
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
  public create = (items: AnnotationsV2CreateSchema[]) => {
    return this.createEndpoint(items);
  };

  /**
   * [Suggest annotations](https://docs.cognite.com/api/playground/#operation/annotationsSuggest)
   */
  public suggest = (items: AnnotationsV2SuggestSchema[]) => {
    return this.createEndpoint(items, this.suggestUrl);
  };

  /**
   * [Retrieve](https://docs.cognite.com/api/playground/#operation/annotationsByids)
   * or [Get an](https://docs.cognite.com/api/playground/#operation/annotationsGet)
   * annotation
   */
  public retrieve = (ids: InternalId[]) => {
    return this.retrieveEndpoint(ids);
  };

  /**
   * [Advanced list of annotations](https://docs.cognite.com/api/playground/#operation/annotationsFilter)
   */
  public list = (
    filter: AnnotationsV2FilterSchema
  ): CursorAndAsyncIterator<AnnotationsV2ResponseSchema> => {
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
  public update = (changes: AnnotationsV2UpdateDataSchema[]) => {
    return this.updateEndpoint(changes);
  };
}
