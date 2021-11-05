import {
  CogniteExternalId,
  CogniteInternalId,
  FilterQuery,
} from '@cognite/sdk-core';

export interface DocumentFeedbackAggregateRequest {
  field: AggregateField;
}

export type AggregateField = 'action' | 'status';

export interface AggregateGroup {
  value: string;
  count: number;
}

export interface DocumentFeedbackAggregateResponse {
  field: AggregateField;
  groups: AggregateGroup[];
  total: number;
}

export type DocumentId = CogniteInternalId;

export interface DocumentFeedbackCreateItem {
  documentId: DocumentId;
  label: FeedbackLabel;
  action: FeedbackAction;
  reporterInfo?: ReporterInfo;
}

export interface FeedbackLabel {
  externalId: CogniteExternalId;
}

export type FeedbackAction = 'ATTACH' | 'DETACH';

export type ReporterInfo = string;

export type FeedbackStatus = 'CREATED' | 'ACCEPTED' | 'REJECTED' | 'STALE';

export interface FeedbackQueryParameters extends FilterQuery {
  status?: FeedbackStatus;
}

export interface DocumentFeedback {
  documentId: DocumentId;
  label: FeedbackLabel;
  action: FeedbackAction;
  feedbackId: number;
  reporterInfo?: ReporterInfo;
  createdAt: string;
  reviewedAt?: string | null;
  status: FeedbackStatus;
}

export interface FeedbackId {
  id: number;
}
