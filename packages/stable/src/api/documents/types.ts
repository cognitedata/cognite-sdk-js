import { CogniteExternalId, CogniteInternalId } from '@cognite/sdk-core';

export type DocumentSearchRequest = DocumentFilterOption &
  DocumentSearch &
  DocumentAggregates &
  DocumentSort &
  DocumentSearchLimit;

/**
 * Filter with exact match
 */
export interface DocumentFilterOption {
  /** Filter with exact match */
  filter?: DocumentFilter;
}

export interface DocumentSearch {
  search?: { query?: string; highlight?: boolean };
}

export interface DocumentAggregates {
  aggregates?: DocumentCountAggregate[];
}

export interface DocumentSort {
  /**
   * List of fields to sort by, currently only supports 1 field.
   * Syntax: `["<fieldname>:asc|desc"]`. Default sort order is `asc` with short syntax `["<fieldname>"]`.
   *
   * @example ["externalId:desc"]
   */
  sort?: string[];
}

export interface DocumentSearchLimit {
  /**
   * Maximum number of items.
   * @format int32
   * @min 0
   * @max 1000
   */
  limit?: number;
}

/**
 * Highlighted snippets from content, name and externalId fields which show where the query matches are.
 */
export interface Highlight {
  /** Matches in name. */
  name?: string[];

  /** Matches in content. */
  content?: string[];
}

/**
 * A document
 */
export interface Document {
  /**
   * Internal ID of the CDF file/document
   * @example 1
   */
  id: CogniteInternalId;

  /**
   * External Id provided by client. Should be unique within a given project/resource combination.
   * @example haml001
   */
  externalId?: CogniteExternalId;

  /**
   * The title of the document
   * @example Hamlet
   */
  title?: string;

  /**
   * The author of the document
   * @example William Shakespeare
   */
  author?: string;

  /**
   * When the document was created, measured in milliseconds since 00:00:00 Thursday, 1 January 1970
   * @example 1519862400000
   */
  createdTime?: DocumentTimestamp;

  /**
   * When the document last modified, measured in milliseconds since 00:00:00 Thursday, 1 January 1970
   * @example 1519958703000
   */
  modifiedTime?: DocumentTimestamp;

  /**
   * When the document was indexed, measured in milliseconds since 00:00:00 Thursday, 1 January 1970
   * @example 1521062805000
   */
  lastIndexedTime?: DocumentTimestamp;

  /**
   * Detected mime type for the document
   * @example text/plain
   */
  mimeType?: string;

  /**
   * Extension of the file (always in lowercase)
   * @example pdf
   */
  extension?: string;

  /**
   * Number of pages for multi-page documents
   * @format int32
   * @example 2
   */
  pageCount?: number;

  /**
   * Detected type for the document
   * @example Document
   */
  type?: string;

  /**
   * The detected language used in the document
   * @example en
   */
  language?: string;

  /**
   * The textual content of the document. Truncated to 155 characters,
   * but subject to change.
   */
  truncatedContent?: string;

  /**
   * The ids of any assets referred to in the document
   * @example [42,101]
   */
  assetIds?: CogniteInternalId[];

  /**
   * A list of labels derived by this pipeline's document classifier.
   * @example [{"externalId":"play"},{"externalId":"tragedy"}]
   */
  labels?: DocumentLabel[];

  /** The source file that this document is derived from. */
  sourceFile: DocumentSourceFile;

  /** GeoJson representation of a geometry. */
  geoLocation?: DocumentGeometry;
}

export interface DocumentLimit {
  /**
   * Maximum number of items.
   * @format int32
   * @min 1
   * @max 1000
   */
  limit?: number;
}

type DocumentFilter =
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

type DocumentFilterProperty = { property: string[] };

type DocumentFilterValue = { value: string | number | boolean | DocumentLabel };

type DocumentFilterValues = {
  values: string[] | number[] | boolean[] | DocumentLabel[];
};

type DocumentFilterRangeValues = {
  gt?: number;
  lt?: number;
  gte?: number;
  lte?: number;
};

type DocumentFilterGeometry = { geometry: DocumentGeometry };

type DocumentFilterPropertyAndValue = DocumentFilterProperty &
  DocumentFilterValue;

type DocumentFilterPropertyAndValues = DocumentFilterProperty &
  DocumentFilterValues;

type DocumentFilterPropertyAndRangeValues = DocumentFilterProperty &
  DocumentFilterRangeValues;

type DocumentFilterPropertyAndGeometry = DocumentFilterProperty &
  DocumentFilterGeometry;

export interface DocumentCountAggregate {
  /** User defined name for this aggregate */
  name: string;

  /**
   * count
   * @example count
   */
  aggregate: string;

  /** List of fields to group the count by. It is currently only possible to group by 1 field or 0 fields. If grouping by 0 fields, the aggregate value is the total count of all documents. */
  groupBy?: DocumentFilterProperty[];
}

/**
 * The number of milliseconds since 00:00:00 Thursday, 1 January 1970, Coordinated Universal Time (UTC), minus leap seconds.
 * @format int64
 * @min 0
 * @example 1638795554528
 */
export type DocumentTimestamp = number;

/**
 * The source file that this document is derived from.
 */
export interface DocumentSourceFile {
  /**
   * Name of the file
   * @example hamlet.txt
   */
  name: string;

  /**
   * The directory the file can be found in
   * @example plays/shakespeare
   */
  directory?: string;

  /**
   * The source of the file
   * @example SubsurfaceConnectors
   */
  source?: string;

  /**
   * The mime type of the file
   * @example application/octet-stream
   */
  mimeType?: string;

  /**
   * The size of the source file in bytes
   * @format int64
   * @example 1000
   */
  size?: number;

  /**
   * The ids of the assets related to this file
   * @example []
   */
  assetIds?: CogniteInternalId[];

  /**
   * A list of labels associated with this document's source file in CDF.
   * @example [{"externalId":"play"},{"externalId":"tragedy"}]
   */
  labels?: DocumentLabel[];

  /** GeoJson representation of a geometry. */
  geoLocation?: DocumentGeometry;

  /** The id if the dataset this file belongs to, if any */
  datasetId?: CogniteInternalId;

  /**
   * The security category IDs required to access this file
   * @example []
   */
  securityCategories?: number[];
  metadata?: Record<string, string>;
}

/**
 * GeoJson representation of a geometry.
 */
export interface DocumentGeometry {
  /** Type of the shape. Currently we support "polygon", "linestring" and "point". */
  type?: DocumentShapeType;

  /** Coordinates of the shape. */
  coordinates?: DocumentShapeCoordinates;
  geometries?: GeometryCollection[];
}

/**
 * A label assigned to a resource.
 */
export interface DocumentLabel {
  /** An external ID to a predefined label definition. */
  externalId: CogniteExternalId;
}

/**
 * Type of the shape. Currently we support "polygon", "linestring" and "point".
 */
export type DocumentShapeType = string;

/**
 * Coordinates of the shape.
 */
export type DocumentShapeCoordinates = any[];

export interface GeometryCollection {
  /** Type of the shape. Currently we support "polygon", "linestring" and "point". */
  type?: DocumentShapeType;

  /** Coordinates of the shape. */
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
