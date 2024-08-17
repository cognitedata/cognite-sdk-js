// Copyright 2020 Cognite AS

import {
  BaseResourceAPI,
  type CursorAndAsyncIterator,
  type FilterQuery,
} from '@cognite/sdk-core';

import type {
  AggregateField,
  DocumentFeedback,
  DocumentFeedbackAcceptRejectItem,
  DocumentFeedbackAcceptRejectRequest,
  DocumentFeedbackAggregateRequest,
  DocumentFeedbackAggregateResponse,
  DocumentFeedbackListResponse,
  FeedbackStatus,
  FeedbackStatusQueryParameter,
} from '../../types';
import type { DocumentFeedbackCreateItem } from './types.gen';

export class FeedbackAPI extends BaseResourceAPI<DocumentFeedback> {
  public aggregates = (
    fieldName: AggregateField,
  ): Promise<DocumentFeedbackAggregateResponse> => {
    const content: DocumentFeedbackAggregateRequest = { field: fieldName };
    return this.aggregateFeedbacks<DocumentFeedbackAggregateResponse>(content);
  };

  public create = (
    feedbacks: DocumentFeedbackCreateItem[],
  ): Promise<DocumentFeedback[]> => {
    return this.createEndpoint<DocumentFeedbackCreateItem>(feedbacks);
  };

  public list = (
    status?: FeedbackStatus,
  ): CursorAndAsyncIterator<DocumentFeedback> => {
    const parameter: FeedbackStatusQueryParameter & FilterQuery = {
      status: status,
    };
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
    endpoint: acceptRejectEndpoint,
  ) {
    const feedbackIds: DocumentFeedbackAcceptRejectItem[] = ids.map((id) => ({
      id,
    }));
    const request: DocumentFeedbackAcceptRejectRequest = {
      items: feedbackIds,
    };
    const path = this.url(endpoint);
    const response = await this.post<DocumentFeedbackListResponse>(path, {
      data: request,
    });
    return this.addToMapAndReturn(response.data.items, response);
  }

  private async aggregateFeedbacks<ResponseType>(
    request: DocumentFeedbackAggregateRequest,
  ): Promise<ResponseType> {
    const response = await this.post<ResponseType>(this.url('aggregates'), {
      data: request,
    });
    return response.data;
  }
}

export type acceptRejectEndpoint = 'accept' | 'reject';
