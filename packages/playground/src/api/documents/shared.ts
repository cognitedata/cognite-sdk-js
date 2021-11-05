import {
  CogniteExternalId,
  CogniteInternalId,
  ExternalId,
  FilterQuery,
  ItemsWrapper,
} from '@cognite/sdk-core';

import {
  FileMimeType,
  FileName,
  Label,
  LabelFilter,
  Metadata,
  PointCoordinates,
  Range,
} from '@cognite/sdk';

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
  shape?: GeoLocation;
  relation?: DocumentsGeoLocationRelation;
  missing?: boolean;
}

export type AssetIdsFilter = ContainsAllIds | ContainsAnyIds;

export interface DocumentsSourceFileFilter {
  name?: StringIn | StringEquals;
  directoryPrefix?: StringIn | StringEquals;
  source?: StringIn | StringEquals;
  mimeType?: StringIn | StringEquals;
  assetIds?: AssetIdsFilter;
  assetSubtreeIds?: ContainsAnyIds | ValueMissing;
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

export interface ValueMissing {
  missing?: boolean;
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
  assetSubtreeIds?: ContainsAnyIds | ValueMissing;
  sourceSystem?: StringIn | StringEquals;
  labels?: LabelFilter;
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

export interface Adder<T> {
  add: T;
  set?: never;
  remove?: never;
}

export interface Remover<T> {
  remove: T;
  set?: never;
  add?: never;
}

export interface Setter<T> {
  set: T;
  remove?: never;
  add?: never;
}

export interface NullSetter {
  setNull: boolean;
  set?: never;
  remove?: never;
  add?: never;
}

export interface UpdateDocumentsPipeline {
  externalId: string;
  sensitivityMatcher?: UpdateDocumentsPipelineSensitivityMatcher;
  classifier?: UpdateDocumentsPipelineClassifier;
}

export interface UpdateDocumentsPipelineSensitivityMatcher {
  matchLists?:
    | Adder<StringToStringArrayMap>
    | Setter<StringToStringArrayMap>
    | Remover<string[]>;
  fieldMappings?: Setter<DocumentsFieldMappings>;
  filterPasswords?: Setter<boolean>;
  sensitiveSecurityCategory?: Setter<boolean> | NullSetter;
  restrictToSources?: Adder<string[]> | Remover<string[]> | Setter<string[]>;
}

export interface UpdateDocumentsPipelineClassifier {
  name?: Setter<string>;
  trainingLabels:
    | Adder<LabelList[]>
    | Remover<LabelList[]>
    | Setter<LabelList[]>;
  activeClassifierId: Setter<number> | NullSetter;
}

export interface DocumentsPipeline {
  externalId: string;
  sensitivityMatcher: SensitivityMatcher;
  classifier: DocumentsPipelineClassifier;
}

export interface DocumentsPipelineClassifier {
  name?: string;
  trainingLabels: LabelList[];
  activeClassifierId?: number;
}

export type LabelList = ExternalId;

export interface SensitivityMatcher {
  matchLists: StringToStringArrayMap;
  fieldMappings: DocumentsFieldMappings;
  filterPasswords?: boolean;
  sensitiveSecurityCategory?: number;
  restrictToSources?: string[];
}

export interface DocumentsFieldMappings {
  title?: string[];
  author?: string[];
  mimeType?: string[];
  type?: string[];
  labelsExternalIds?: string[];
  sourceFile?: DocumentsSourceFile;
}

export interface DocumentsSourceFile {
  name?: string[];
  directory?: string[];
  content?: string[];
  metadata?: StringToStringArrayMap;
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
