// Copyright 2020 Cognite AS

import {
  BaseResourceAPI,
  CursorAndAsyncIterator,
  ItemsWrapper,
} from '@cognite/sdk-core';

import {
  AggregateField,
  DocumentFeedback,
  DocumentFeedbackAggregateRequest,
  DocumentFeedbackAggregateResponse,
  DocumentFeedbackCreateItem,
  DocumentFeedbackCreateRequest,
  DocumentFeedbackId,
  FeedbackQueryParameters,
  FeedbackStatus,
  ItemWrapper,
} from '../../types';

export class FeedbackAPI extends BaseResourceAPI<DocumentFeedback> {
  public aggregates = (
    fieldName: AggregateField
  ): Promise<DocumentFeedbackAggregateResponse> => {
    const content: DocumentFeedbackAggregateRequest = { field: fieldName };
    return this.aggregateFeedbacks<DocumentFeedbackAggregateResponse>(content);
  };

  public create = (
    content: DocumentFeedbackCreateItem
  ): Promise<ItemWrapper<DocumentFeedback>> => {
    return this.createFeedback<ItemWrapper<DocumentFeedback>>({
      item: content,
    });
  };

  public list = (
    status: FeedbackStatus
  ): CursorAndAsyncIterator<DocumentFeedback> => {
    const parameter: FeedbackQueryParameters = { status: status };
    return this.listEndpoint(this.callListEndpointWithGet, parameter);
  };

  public accept = (ids: number[]) => {
    return this.postAcceptRejectFeedback(ids, 'accept');
  };

  public reject = (ids: number[]) => {
    return this.postAcceptRejectFeedback(ids, 'reject');
  };

  private async postAcceptRejectFeedback(
    ids: number[],
    endpoint: acceptRejectEndpoint
  ) {
    const wrappedIds = ids.map(id => {
      return <DocumentFeedbackId>{ id: id };
    });
    const content: ItemsWrapper<DocumentFeedbackId[]> = { items: wrappedIds };
    const path = this.url(endpoint);
    const response = await this.post<ItemsWrapper<(DocumentFeedback)[]>>(path, {
      data: content,
    });
    return this.addToMapAndReturn(response.data.items, response);
  }

  private async createFeedback<ResponseType>(
    request: DocumentFeedbackCreateRequest
  ): Promise<ResponseType> {
    const response = await this.post<ResponseType>(this.url(), {
      data: request,
    });
    return response.data;
  }

  private async aggregateFeedbacks<ResponseType>(
    request: DocumentFeedbackAggregateRequest
  ): Promise<ResponseType> {
    const response = await this.post<ResponseType>(this.url('aggregates'), {
      data: request,
    });
    return response.data;
  }
}

export type acceptRejectEndpoint = 'accept' | 'reject';
