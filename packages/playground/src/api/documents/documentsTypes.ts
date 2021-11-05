import {
  CogniteExternalId,
  CogniteInternalId,
  FileMimeType,
  FileName,
  ItemsWrapper,
  Label,
  LabelFilter,
  Metadata,
  PointCoordinates,
  Range,
} from '@cognite/sdk';
import {
  EpochTimestampRange,
  ValueMissing,
  ContainsAll,
  ContainsAny,
  In,
  Equals,
  DocumentId,
} from './shared';

export type DocumentsGeoLocationRelation = 'intersects' | 'disjoint' | 'within';

export interface GeoLocationFilter {
  shape?: GeoLocation;
  relation?: DocumentsGeoLocationRelation;
  missing?: boolean;
}

export type AssetIdsFilter =
  | ContainsAll<CogniteInternalId>
  | ContainsAny<CogniteInternalId>;

export interface DocumentsSourceFileFilter {
  name?: In<string> | Equals<string>;
  directoryPrefix?: In<string> | Equals<string>;
  source?: In<string> | Equals<string>;
  mimeType?: In<string> | Equals<string>;
  assetIds?: AssetIdsFilter;
  assetSubtreeIds?: ContainsAny<CogniteInternalId> | ValueMissing;
  uploadedTime?: EpochTimestampRange;
  createdTime?: EpochTimestampRange;
  sourceCreatedTime?: EpochTimestampRange;
  sourceModifiedTime?: EpochTimestampRange;
  lastUpdatedTime?: EpochTimestampRange;
  labels?: LabelFilter;
  geoLocation?: GeoLocationFilter;
  datasetId?: In<number> | Equals<number>;
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
  id?: In<DocumentId> | Equals<DocumentId> | ValueMissing;
  externalIdPrefix?:
    | In<CogniteExternalId>
    | Equals<CogniteExternalId>
    | ValueMissing;
  title?: In<string> | Equals<string> | ValueMissing;
  author?: In<string> | Equals<string> | ValueMissing;
  createdTime?: EpochTimestampRange;
  mimeType?: In<string> | Equals<string> | ValueMissing;
  pageCount?: Range<number>;
  type?: In<string> | Equals<string> | ValueMissing;
  language?: In<string> | Equals<string> | ValueMissing;
  assetIds?:
    | ContainsAll<CogniteInternalId>
    | ContainsAny<CogniteInternalId>
    | ValueMissing;
  assetSubtreeIds?: ContainsAny<CogniteInternalId> | ValueMissing;
  sourceSystem?: In<string> | Equals<string> | ValueMissing;
  labels?: ContainsAny<Label> | ContainsAll<Label> | ValueMissing;
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
  id: DocumentId;
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
  labels?: Label[];
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
