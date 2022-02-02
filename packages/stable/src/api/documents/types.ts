import { CogniteExternalId, CogniteInternalId } from '@cognite/sdk-core';

export type DocumentSearchRequest = DocumentFilterOption &
  DocumentSearch &
  DocumentAggregates &
  DocumentSort &
  DocumentSearchLimit;

export interface DocumentFilterOption {
  filter?: DocumentFilter;
}

export interface DocumentSearch {
  search?: { query?: string; highlight?: boolean };
}

export interface DocumentAggregates {
  aggregates?: DocumentCountAggregate[];
}

export interface DocumentSort {
  sort?: DocumentSortItem[];
}

export type DocumentSortOrder = 'asc' | 'desc';

export type DocumentSortItem = DocumentFilterProperty & {
  order: DocumentSortOrder;
};

export interface DocumentSearchLimit {
  limit?: number;
}

export interface Highlight {
  name?: string[];
  content?: string[];
}

export interface Document {
  id: CogniteInternalId;
  externalId?: CogniteExternalId;
  title?: string;
  author?: string;
  createdTime?: DocumentTimestamp;
  modifiedTime?: DocumentTimestamp;
  lastIndexedTime?: DocumentTimestamp;
  mimeType?: string;
  extension?: string;
  pageCount?: number;
  type?: string;
  language?: string;
  truncatedContent?: string;
  assetIds?: CogniteInternalId[];
  labels?: DocumentLabel[];
  sourceFile: DocumentSourceFile;
  geoLocation?: DocumentGeoJsonGeometry;
}

export interface DocumentLimit {
  limit?: number;
}

export type DocumentFilter =
  | {
      or: DocumentFilter[];
    }
  | {
      and: DocumentFilter[];
    }
  | {
      not: DocumentFilter;
    }
  | {
      equals: DocumentFilterPropertyAndValue;
    }
  | {
      prefix: DocumentFilterPropertyAndValue;
    }
  | {
      in: DocumentFilterPropertyAndValues;
    }
  | {
      containsAny: DocumentFilterPropertyAndValues;
    }
  | {
      containsAll: DocumentFilterPropertyAndValues;
    }
  | {
      range: DocumentFilterPropertyAndRangeValues;
    }
  | {
      exists: DocumentFilterProperty;
    }
  | {
      geojsonIntersects: DocumentFilterPropertyAndGeometry;
    }
  | {
      geojsonDisjoint: DocumentFilterPropertyAndGeometry;
    }
  | {
      geojsonWithin: DocumentFilterPropertyAndGeometry;
    };

export type DocumentFilterProperty = { property: string[] };

export type DocumentFilterValue = {
  value: string | number | boolean | DocumentLabel;
};

export type DocumentFilterValues = {
  values: string[] | number[] | boolean[] | DocumentLabel[];
};

export type DocumentFilterRangeValues = {
  gt?: number;
  lt?: number;
  gte?: number;
  lte?: number;
};

export type DocumentFilterGeometry = { geometry: DocumentGeoJsonGeometry };

export type DocumentFilterPropertyAndValue = DocumentFilterProperty &
  DocumentFilterValue;

export type DocumentFilterPropertyAndValues = DocumentFilterProperty &
  DocumentFilterValues;

export type DocumentFilterPropertyAndRangeValues = DocumentFilterProperty &
  DocumentFilterRangeValues;

export type DocumentFilterPropertyAndGeometry = DocumentFilterProperty &
  DocumentFilterGeometry;

export type DocumentAggregateType = 'count';

export interface DocumentCountAggregate {
  name: string;
  aggregate: DocumentAggregateType;
  groupBy?: DocumentFilterProperty[];
}

export type DocumentTimestamp = number;

export interface DocumentSourceFile {
  name: string;
  directory?: string;
  source?: string;
  mimeType?: string;
  size?: number;
  assetIds?: CogniteInternalId[];
  labels?: DocumentLabel[];
  geoLocation?: DocumentGeoJsonGeometry;
  datasetId?: CogniteInternalId;
  securityCategories?: number[];
  metadata?: Record<string, string>;
}

export interface DocumentGeoJsonGeometry {
  type?: DocumentShapeType;
  coordinates?: DocumentShapeCoordinates;
  geometries?: GeometryCollection[];
}

export interface DocumentLabel {
  externalId: CogniteExternalId;
}

export type DocumentShapeType = string;

export type DocumentShapeCoordinates = any[];

export interface GeometryCollection {
  type?: DocumentShapeType;
  coordinates?: DocumentShapeCoordinates;
}

export interface DocumentSearchResponse {
  items: { highlight?: Highlight; item: Document }[];
  aggregates?: {
    name: string;
    groups: {
      group: DocumentFilterPropertyAndValue[];
      count: number;
    }[];
    total: number;
  }[];
}
