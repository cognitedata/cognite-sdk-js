// Copyright 2020 Cognite AS

import {
  CogniteInternalId,
  ExternalId,
  GeoLocationGeometry,
  LabelFilter,
  PointCoordinates,
  IdEither,
  AssetFilterProps,
  CogniteExternalId,
  EventFilter,
  FileFilter,
  FilterQuery,
  SequenceFilter,
  TimeseriesFilter,
  Timestamp,
} from '@cognite/sdk';

// This file is here mostly to allow apis to import { ... } from '../../types';
// Overriding types should probably be done in their respective API endpoint files, where possible

export interface ExternalTemplateGroup extends ExternalId {
  /**
   * The externalId of a Template Group
   */
  externalId: CogniteExternalId;

  /**
   * The description of a Template Group
   */
  description?: string;

  /**
   * The owners of a Template Group
   */
  owners?: string[];
}

export type TemplateGroup = ExternalTemplateGroup & {
  /**
   * The owners of a Template Group
   */
  owners: string[];

  /**
   * When resource was created
   */
  createdTime: Timestamp;

  /**
   * When resource was last updated
   */
  lastUpdatedTime: Timestamp;
};

export interface TemplateGroupFilter {
  /**
   * Filter on owners.
   */
  owners?: string[];
}

export interface TemplateGroupFilterQuery extends FilterQuery {
  filter?: TemplateGroupFilter;
}

export interface TemplateGroupVersion {
  version: number;
  schema: string;

  /**
   * When resource was created
   */
  createdTime: Timestamp;

  /**
   * When resource was last updated
   */
  lastUpdatedTime: Timestamp;
}

export enum ConflictMode {
  /** Patch the existing version, but will fail if there are breaking changes. */
  Patch = 'Patch',
  /** Update the Template Group by bumping the version. */
  Update = 'Update',
  /** Force update the existing version even if there are breaking changes. Note, this can break consumers of that version. */
  Force = 'Force',
}

export interface ExternalTemplateGroupVersion {
  schema: string;
  /** Specifies the conflict mode to use. By default the mode is 'ConflictMode.Patch'.*/
  conflictMode?: ConflictMode;
  version?: number;
}

export interface TemplateGroupVersionFilter extends FilterQuery {
  minVersion?: number;
  maxVersion?: number;
}

export interface TemplateGroupVersionFilterQuery extends FilterQuery {
  filter?: TemplateGroupVersionFilter;
}

export interface ExternalTemplateInstance extends ExternalId {
  templateName: string;
  dataSetId?: number;
  fieldResolvers: { [K in string]: FieldResolver | {} };
}

export type TemplateInstance = ExternalTemplateInstance & {
  /**
   * When resource was created
   */
  createdTime: Timestamp;

  /**
   * When resource was last updated
   */
  lastUpdatedTime: Timestamp;
};

export interface FieldResolver {
  type: string;
}

export class ConstantResolver implements FieldResolver {
  type = 'constant';
  value: {};

  constructor(value: {}) {
    this.value = value;
  }
}

export class RawResolver implements FieldResolver {
  type = 'raw';
  dbName: string;
  tableName: string;
  rowKey?: string;
  columnName?: string;

  constructor(
    dbName: string,
    tableName: string,
    rowKey?: string,
    columnName?: string
  ) {
    this.dbName = dbName;
    this.tableName = tableName;
    this.rowKey = rowKey;
    this.columnName = columnName;
  }
}

export class SyntheticTimeSeriesResolver implements FieldResolver {
  type = 'syntheticTimeSeries';
  expression: string;
  name?: string;
  metadata?: { [K in string]: string };
  description?: string;
  isStep?: boolean;
  isString?: boolean;
  unit?: string;

  constructor(
    expression: string,
    name?: string,
    metadata?: { [K in string]: string },
    description?: string,
    isStep?: boolean,
    isString?: boolean,
    unit?: string
  ) {
    this.expression = expression;
    this.name = name;
    this.metadata = metadata;
    this.description = description;
    this.isStep = isStep;
    this.isString = isString;
    this.unit = unit;
  }
}

export class ViewResolver implements FieldResolver {
  type = 'view';
  externalId: string;
  input: { [K in string]: any };

  constructor(externalId: string, input: { [K in string]: any }) {
    this.externalId = externalId;
    this.input = input;
  }
}

export interface TemplateInstanceFilter {
  dataSetIds?: number[];
  templateNames?: string[];
}

export interface TemplateInstanceFilterQuery extends FilterQuery {
  filter?: TemplateInstanceFilter;
}

export type GraphQlResponse = {
  data: any;
  errors: GraphQlError[];
};

export type GraphQlError = {
  message: string;
  path: string[];
  locations: { line: number; column: number }[];
};

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

export type DocumentsGeoLocationType =
  | 'Point'
  | 'MultiPolygon'
  | 'MultiLineString'
  | 'MultiPoint'
  | 'Polygon'
  | 'LineString';

export type DocumentsGeoLocationRelation = 'INTERSECTS' | 'DISJOINT' | 'WITHIN';

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
  type?: StringIn | StringEquals;
  language?: StringIn | StringEquals;
  assetIds?: ContainsAllIds | ContainsAnyIds;
  sourceSystem?: StringIn | StringEquals;
  labels?: LabelFilter;
  geoLocation?: GeoLocationFilter;
  sourceFile?: DocumentsSourceFileFilter;
  size?: NumberRange;
}

export interface NumberRange {
  max?: number;
  min?: number;
}

export interface DocumentsSearch {
  query: string;
  highlight?: boolean;
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

export interface Document {
  id: number;
  externalId?: CogniteExternalId;
  title?: string;
  author?: string;
  createdTime?: number;
  lastIndexedTime?: number;
  mimeType?: string;
  type?: string;
  language?: string;
  truncatedContent?: string;
  assetIds?: number[];
  labels?: LabelList[];
  sourceSystem?: string;
  sourceFile: any;
  geoLocation: GeoLocation;
  size: number;
}

export type GeoLocationTypeEnum = 'Feature';

export interface GeoLocation {
  type: GeoLocationTypeEnum;
  geometry: GeoLocationGeometry<DocumentsGeoLocationType, PointCoordinates[]>;
  properties?: StringToAnyMap;
}

export interface DocumentsAggregate {
  name: string;
  groups: DocumentsAggregateGroup[];
  total: number;
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
  status: FeedbackStatus;
}

export interface DocumentFeedback {
  documentId: DocumentId;
  label: FeedbackLabel;
  action: FeedbackAction;
  feedbackId: IdEither;
  reporterInfo?: ReporterInfo;
  createdAt: string;
  reviewedAt?: string | null;
  status: FeedbackStatus;
}

export type Source =
  | EventsSource
  | AssetsSource
  | SequencesSource
  | TimeSeriesSource
  | FilesSource;

type ObjectOrString<T> = { [K in keyof T]: ObjectOrString<T[K]> | string };

export type EventsSource = {
  type: 'events';
  filter?: ObjectOrString<EventFilter>;
  mappings?: { [K in string]: string };
};

export type AssetsSource = {
  type: 'assets';
  filter?: ObjectOrString<AssetFilterProps>;
  mappings?: { [K in string]: string };
};

export type SequencesSource = {
  type: 'sequences';
  filter?: ObjectOrString<SequenceFilter>;
  mappings?: { [K in string]: string };
};

export type TimeSeriesSource = {
  type: 'timeSeries';
  filter?: ObjectOrString<TimeseriesFilter>;
  mappings?: { [K in string]: string };
};

export type FilesSource = {
  type: 'files';
  filter?: ObjectOrString<FileFilter>;
  mappings?: { [K in string]: string };
};

export type ExternalView = {
  externalId: string;
  source: Source;
};

export type View = ExternalView & {
  createdTime: Timestamp;
  lastUpdatedTime: Timestamp;
};

export type ViewFilterQuery = FilterQuery;

export interface ViewResolveRequest extends FilterQuery {
  externalId: string;
  input?: { [K in string]: any };
  cursor?: string;
  limit?: number;
}
