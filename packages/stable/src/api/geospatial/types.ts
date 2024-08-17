import type { Cursor, ExternalId, InternalId, Limit } from '@cognite/sdk-core';

import { GeoJSON, type Geometry } from 'geojson';

export { GeoJSON };

export type GeometryType = 'WKT' | 'GEOJSON';

type GeometryPropertyType =
  | 'GEOMETRY'
  | 'POINT'
  | 'LINESTRING'
  | 'POLYGON'
  | 'MULTIPOINT'
  | 'MULTILINESTRING'
  | 'MULTIPOLYGON'
  | 'GEOMETRYCOLLECTION'
  | 'GEOMETRYZ'
  | 'POINTZ'
  | 'LINESTRINGZ'
  | 'POLYGONZ'
  | 'MULTIPOINTZ'
  | 'MULTILINESTRINGZ'
  | 'MULTIPOLYGONZ'
  | 'GEOMETRYM'
  | 'POINTM'
  | 'LINESTRINGM'
  | 'POLYGONM'
  | 'MULTIPOINTM'
  | 'MULTILINESTRINGM'
  | 'MULTIPOLYGONM'
  | 'GEOMETRYCOLLECTIONM'
  | 'GEOMETRYZM'
  | 'POINTZM'
  | 'LINESTRINGZM'
  | 'POLYGONZM'
  | 'MULTIPOINTZM'
  | 'MULTILINESTRINGZM'
  | 'MULTIPOLYGONZM'
  | 'GEOMETRYCOLLECTIONZM';

export type GeospatialPropertyType =
  | 'STRING'
  | 'LONG'
  | 'DOUBLE'
  | 'BOOLEAN'
  | 'TIMESTAMP'
  | GeometryPropertyType;

export type GeospatialFeatureTypeProperty =
  | {
      type: Exclude<GeospatialPropertyType, GeometryPropertyType | 'STRING'>;
      description?: string;
      optional?: boolean;
    }
  | {
      type: GeometryPropertyType;
      srid?: number;
      description?: string;
      optional?: boolean;
    }
  | {
      type: 'STRING';
      size: number;
      description?: string;
      optional?: boolean;
    };

type Properties = Record<string, GeospatialFeatureTypeProperty>;

export interface Geospatial {
  featureType: unknown;
  feature: unknown;
  crs: unknown;
}

export interface GeospatialFeature extends ExternalId {
  [property: string]: string | number | boolean | { wkt: string } | Geometry;
}

export interface GeospatialFeatureResponse extends GeospatialFeature {
  createdTime: number;
  lastUpdatedTime: number;
}

export interface FeatureType extends ExternalId, InternalId {
  properties: Properties & {
    createdTime: { type: 'LONG' };
    lastUpdatedTime: { type: 'LONG' };
    externalId: { type: 'STRING'; size: 32 };
  };
  searchSpec?: {
    [indexName: string]: GeospatialIndexSpec;
    createdTimeIdx: {
      properties: ['createdTime'];
    };
    lastUpdatedTimeIdx: {
      properties: ['lastUpdatedTime'];
    };
    externalIdIdx: {
      properties: ['externalId'];
    };
  };
}

type GeospatialIndexSpec = {
  properties: string[];
};

export interface GeospatialCreateFeatureType extends ExternalId {
  properties: Properties;
  searchSpec?: {
    [indexName: string]: GeospatialIndexSpec;
  };
}

export interface GeospatialUpdateFeatureType extends ExternalId {
  update:
    | {
        properties: { add: Properties } | { remove: string[] };
      }
    | {
        searchSpec:
          | {
              add: { [indexName: string]: { properties: string[] } };
            }
          | { remove: string[] };
      };
}

export interface GeospatialRecursiveDelete {
  recursive?: boolean;
}

export interface GeospatialOutput {
  output?:
    | {
        geometryFormat: GeometryType;
      }
    | {
        properties: Record<string, unknown>;
      };
}

interface GeospatialPropertyAndValue {
  property: string;
  value: unknown;
}

interface GeospatialPropertyAndPattern {
  property: string;
  pattern: string;
}

interface GeospatialAllowCrsTransformation {
  allowCrsTransformation?: boolean;
}
interface GeospatialAllowDimensionalityMismatch {
  allowDimensionalityMismatch?: boolean;
}

type GeospatialFeatureFilter =
  | {
      or: GeospatialFeatureFilter[];
    }
  | {
      and: GeospatialFeatureFilter[];
    }
  | {
      not: GeospatialFeatureFilter;
    }
  | {
      equals: GeospatialPropertyAndValue;
    }
  | {
      missing: { property: string };
    }
  | {
      like: GeospatialPropertyAndPattern;
    }
  | {
      regex: GeospatialPropertyAndPattern;
    }
  | {
      range:
        | { property: string; gt: string | number }
        | { property: string; lt: string | number }
        | { property: string; gte: string | number }
        | { property: string; lte: string | number };
    }
  | {
      stWithin: GeospatialPropertyAndValue;
    }
  | {
      stContains: GeospatialPropertyAndValue;
    }
  | {
      stIntersects: GeospatialPropertyAndValue;
    }
  | {
      stContainsProperly: GeospatialPropertyAndValue;
    }
  | {
      stWithinProperly: GeospatialPropertyAndValue;
    }
  | {
      stWithinDistance: GeospatialPropertyAndValue & { distance: number };
    };

export interface GeospatialFeatureSearchFilter
  extends GeospatialAllowCrsTransformation,
    GeospatialAllowDimensionalityMismatch,
    Limit,
    GeospatialOutput {
  filter?: GeospatialFeatureFilter;
  sort?: string[];
}

export interface GeospatialFeatureSearchStreamFilter
  extends GeospatialAllowCrsTransformation,
    GeospatialAllowDimensionalityMismatch,
    Limit {
  filter?: GeospatialFeatureFilter;
  output?:
    | GeospatialOutput['output']
    | {
        jsonStreamFormat:
          | 'LENGTH_PREFIXED'
          | 'NEW_LINE_DELIMITED'
          | 'CONCATENATED'
          | 'RECORD_SEPARATOR_DELIMITED';
      };
}

export interface GeospatialFeatureListFilter
  extends GeospatialFeatureSearchStreamFilter,
    Cursor {}

/**
 * Search stream returns a string of delimited json of features (GeospatialFeatureResponse[]).
 * jsonStreamFormat in the filter decides what the delimiter will be.
 */
export type GeospatialFeatureSearchStreamResponse = string;

export interface FeatureAggregateParams {
  filter?: GeospatialFeatureFilter;
  aggregates: Aggregates[];
  property: string;
  outputSrid?: number;
  groupBy?: string[];
}

type Aggregates =
  | 'avg'
  | 'count'
  | 'max'
  | 'min'
  | 'stCentroid'
  | 'stCollect'
  | 'stConvexHull'
  | 'stIntersection'
  | 'stUnion'
  | 'sum'
  | 'variance';

export interface GeospatialCoordinateReferenceSystem {
  srid: number;
  wkt: string;
  projString: string;
}

export interface GeospatialCRSResponse
  extends GeospatialCoordinateReferenceSystem {
  createdTime: number;
  lastUpdatedTime: number;
}

export interface GeospatialSridId {
  srid: number;
}

export type GeospatialComputeFunction = {
  stTransform: GeospatialGeometryTransformComputeFunction;
};

export interface GeospatialGeometryTransformComputeFunction {
  geometry: GeospatialExtendedWellKnownText;
  srid: number;
}

export interface GeospatialExtendedWellKnownText {
  ewkt: string;
}

export interface GeospatialComputedItemList {
  items: Record<string, unknown>[];
}

export interface GeospatialJsonComputeOutput {
  output: Record<string, GeospatialComputeFunction>;
}
