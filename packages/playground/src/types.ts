// Copyright 2020 Cognite AS

import {
  CogniteExternalId,
  CogniteInternalId,
  ExternalId,
  FilterQuery,
  GeoLocationGeometry,
  LabelFilter,
  PointCoordinates,
  Label,
  Range,
  FileName,
  FileMimeType,
  Metadata,
  ItemsWrapper,
} from '@cognite/sdk';

// This file is here mostly to allow apis to import { ... } from '../../types';
// Overriding types should probably be done in their respective API endpoint files, where possible

export interface IntIn {
  in: number[];
}

export interface IntEquals {
  equals: number;
}

export interface StringIn {
  in: string[];
}

export interface StringEquals {
  equals: string;
}

export interface EpochTimestampRange {
  max: number;
  min: number;
}

export interface ContainsAllIds {
  containsAll: CogniteInternalId[];
}

export interface ContainsAnyIds {
  containsAny: CogniteInternalId[];
}

export type DocumentsGeoLocationRelation = 'intersects' | 'disjoint' | 'within';

export interface GeoLocationFilter {
  relation: DocumentsGeoLocationRelation;
  shape: GeoLocationGeometry<DocumentsGeoLocationType, PointCoordinates[]>;
}

export type AssetIdsFilter = ContainsAllIds | ContainsAnyIds;

export interface DocumentsSourceFileFilter {
  name?: StringIn | StringEquals;
  directoryPrefix?: StringIn | StringEquals;
  source?: StringIn | StringEquals;
  mimeType?: StringIn | StringEquals;
  assetIds?: AssetIdsFilter;
  uploadedTime?: EpochTimestampRange;
  createdTime?: EpochTimestampRange;
  sourceCreatedTime?: EpochTimestampRange;
  sourceModifiedTime?: EpochTimestampRange;
  lastUpdatedTime?: EpochTimestampRange;
  labels?: LabelFilter;
  geoLocation?: GeoLocationFilter;
  datasetId?: IntIn | IntEquals;
  size?: Range<number>;
}

export interface ExternalDocumentsSearch {
  filter?: DocumentsFilter;
  search?: DocumentsSearch;
  aggregates?: DocumentsCountAggregate[] | DocumentsDateHistogramAggregate[];
  sort?: string[];
  limit?: number;
}

export interface DocumentsFilter {
  id?: IntIn | IntEquals;
  externalIdPrefix?: StringIn | StringEquals;
  title?: StringIn | StringEquals;
  author?: StringIn | StringEquals;
  createdTime?: EpochTimestampRange;
  mimeType?: StringIn | StringEquals;
  pageCount?: Range<number>;
  type?: StringIn | StringEquals;
  language?: StringIn | StringEquals;
  assetIds?: ContainsAllIds | ContainsAnyIds;
  sourceSystem?: StringIn | StringEquals;
  labels?: Label[];
  geoLocation?: GeoLocationFilter;
  sourceFile?: DocumentsSourceFileFilter;
}

export interface DocumentsSearch {
  query: string;
  highlight?: boolean;
}

export interface DocumentsSearchWrapper {
  item: Document;
  highlight?: Highlight;
}

export interface Highlight {
  name?: string[];
  content?: string[];
}

export interface DocumentsCountAggregate {
  name: string;
  aggregate: string;
  groupBy?: string[];
}

export interface DocumentsDateHistogramAggregate {
  name: string;
  aggregate: string;
  field: string;
  interval: string;
}

export interface DocumentContent {
  id: number;
  content: string;
}

export interface Document {
  id: number;
  externalId?: CogniteExternalId;
  title?: string;
  author?: string;
  createdTime?: number;
  lastIndexedTime?: number;
  mimeType?: string;
  pageCount?: number;
  type?: string;
  language?: string;
  truncatedContent?: string;
  assetIds?: number[];
  labels?: LabelList[];
  sourceSystem?: string;
  sourceFile: DocumentSourceFile;
  geoLocation: GeoLocation;
}

export interface DocumentSourceFile {
  name: FileName;
  source?: string;
  mimeType?: FileMimeType;
  directory?: string;
  metadata?: Metadata;
  assetIds?: CogniteInternalId[];
  datasetId?: CogniteInternalId;
  securityCategories?: CogniteInternalId[];
  sourceCreatedTime?: Date;
  sourceModifiedTime?: Date;
  uploadedTime?: Date;
  lastUpdatedTime?: Date;
  lastIndexedTime?: Date;
  createdTime?: Date;
  labels?: Label[];
  geoLocation?: GeoLocation;
  size?: number;
}

export type DocumentsGeoLocationRootType =
  | 'GeometryCollection'
  | DocumentsGeoLocationType;
export type DocumentsGeoLocationType =
  | 'Point'
  | 'MultiPolygon'
  | 'MultiLineString'
  | 'MultiPoint'
  | 'Polygon'
  | 'LineString';

// https://datatracker.ietf.org/doc/html/rfc7946#section-3.1.2
// when the type is Point | (MultiPoint | LineString) | MultiLineString respectively
// these containers should also allow Polygon, MultiPolygon to be correctly populated
export type GeoLocationCoordinates =
  | PointCoordinates
  | PointCoordinates[]
  | PointCoordinates[][];

export interface GeoCoordinates {
  type: DocumentsGeoLocationType;
  coordinates?: GeoLocationCoordinates;
}

export interface GeoLocation {
  type: DocumentsGeoLocationRootType;
  coordinates?: GeoLocationCoordinates;
  geometries?: GeoCoordinates[];
}

export interface DocumentsAggregate {
  name: string;
  groups: DocumentsAggregateGroup[];
  total: number;
}

export interface DocumentsAggregatesResponse<T> extends ItemsWrapper<T> {
  aggregates?: DocumentsAggregate[];
}

export interface LabelDefinitionExternalId {
  externalId: CogniteExternalId;
}

export interface DocumentsAggregateGroup {
  group: any[] | LabelDefinitionExternalId[];
  value: number;
}

export interface DocumentsRequestFilter {
  filter?: DocumentsFilter;
  limit?: number;
  cursor?: string;
}

export interface DocumentsPipeline {
  externalId: string;
  sensitivityMatcher?: SensitivityMatcher;
  classifier?: {
    trainingLabels: LabelList[];
  };
}

export type LabelList = ExternalId;

export interface SensitivityMatcher {
  matchLists?: StringToStringArrayMap;
  fieldMappings?: DocumentsFieldMappings;
  sensitiveSecurityCategory?: number;
  restrictToSources?: string[];
}

export interface DocumentsFieldMappings {
  title?: string;
  author?: string;
  mimeType?: string;
  type?: string;
  labelsExternalIds?: string[];
  sourceFile?: DocumentsSourceFile;
  filterPasswords?: boolean;
}

export interface DocumentsSourceFile {
  name?: string;
  directory?: string;
  content?: string;
  metadata?: StringToStringMap;
}

export type StringToStringArrayMap = {
  [key: string]: string[];
};

export type StringToStringMap = {
  [key: string]: string;
};

export type StringToAnyMap = {
  [key: string]: string;
};

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

export interface DocumentPreviewTemporaryLink {
  temporaryLink: string;
}

export type FunctionStatus = 'Queued' | 'Deploying' | 'Ready' | 'Failed';

export type FileId = CogniteInternalId;

export interface CogniteFunctionError {
  code: number;
  message: string;
}
export interface Function {
  id: CogniteInternalId;
  createdTime: Date;
  status: FunctionStatus;
  name: string;
  externalId?: CogniteExternalId;
  fileId: FileId;
  owner?: string;
  description?: string;
  apiKey?: string;
  secrets?: Record<string, string>;
  functionPath?: string;
  envVars?: Record<string, string>;
  cpu?: number;
  memory?: number;
  error?: CogniteFunctionError;
}

export interface FunctionFilter {
  name?: string;
  owner?: string;
  fileId?: FileId;
  status?: FunctionStatus;
  externalIdPrefix?: string;
  createdTime?: Date;
}

export interface FunctionCreate {
  name: string;
  externalId?: CogniteExternalId;
  fileId: FileId;
  owner?: string;
  description?: string;
  apiKey?: string;
  secrets?: Record<string, string>;
  functionPath?: string;
  envVars?: Record<string, string>;
  cpu?: number;
  memory?: number;
}

export interface CallFunction {
  data: object;
  nonce: string;
}

export interface FunctionCallError {
  trace?: string;
  message: string;
}

export type FunctionCallStatus = 'Running' | 'Completed' | 'Failed' | 'Timeout';
export type FunctionId = CogniteInternalId;
export type FunctionCallId = CogniteInternalId;

export interface FunctionCall {
  id: CogniteInternalId;
  status: FunctionCallStatus;
  startTime: Date;
  endTime?: Date;
  error?: FunctionCallError;
  scheduleId?: CogniteInternalId;
  functionId: FunctionId;
  scheduledTime?: Date;
}

export interface FunctionCallFilter {
  scheduleId?: CogniteInternalId;
  status?: FunctionCallStatus;
  startTime?: Date;
  endTime?: Date;
}

export interface FunctionCallFilterQuery extends FilterQuery {
  filter?: FunctionCallFilter;
  limit?: number;
  cursor?: string;
}
export interface FunctionCallLogEntry {
  timestemp?: Date;
  message?: string;
}

export interface FunctionCallResponse {
  response: object;
  functionId: FunctionId;
  callId: FunctionCallId;
}

export interface FunctionScheduleCreate {
  name: string;
  description?: string;
  cronExpression: string;
  functionId?: FunctionId;
  functionExternalId?: string;
  data?: object;
  nonce?: string;
}

export interface FunctionSchedule {
  id: CogniteInternalId;
  name: string;
  createdTime: Date;
  description?: string;
  cronExpression: string;
  functionId?: FunctionId;
  functionExternalId?: string;
}

export interface FunctionSchedulesFilter {
  name?: string;
  FunctionId?: FunctionId;
  FunctionExternalId?: string;
  createdTime?: Date;
  cronExpression?: string;
}
